package com.nsbm.bunmart.product.services;

import com.nsbm.bunmart.product.errors.*;
import com.nsbm.bunmart.product.model.Category;
import com.nsbm.bunmart.product.model.Product;
import com.nsbm.bunmart.product.repositories.CategoryRepository;
import com.nsbm.bunmart.product.repositories.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Product addProduct(Integer categoryId, String name, String imageBase64, String description,
                              List<String> tags, String weight, Boolean availability)
            throws CategoryNotFoundException, ProductNotSavedException, DatabaseExceptionException, DuplicateProductException {
        Category category = getCategory(categoryId);
        if (productRepository.existsByCategory_IdAndName(categoryId, name)) {
            throw new DuplicateProductException("A product with the same name already exists in this category");
        }
        Product product = new Product();
        product.setName(name);
        product.setImageBase64(imageBase64);
        product.setDescription(description);
        product.setTags(tags != null ? tags : new ArrayList<>());
        product.setWeight(weight);
        product.setAvailability(availability != null ? availability : true);
        product.setCategory(category);

        try {
            return productRepository.save(product);
        } catch (DataIntegrityViolationException e) {
            log.error(e.getMessage());
            throw new DatabaseExceptionException("Product could not be created: invalid data");
        } catch (DataAccessException e) {
            log.error(e.getMessage());
            throw new ProductNotSavedException("Product could not be saved");
        }
    }

    public Product updateProductDetails(String productId, String name, String description,
                                        List<String> tags, String weight, Boolean availability, Integer categoryId)
            throws ProductNotFoundException, CategoryNotFoundException, ProductNotSavedException, DatabaseExceptionException {
        Product product = getProduct(productId);
        if (name != null) {
            product.setName(name);
        }
        if (description != null) {
            product.setDescription(description);
        }
        if (tags != null) {
            product.setTags(tags);
        }
        if (weight != null) {
            product.setWeight(weight);
        }
        if (availability != null) {
            product.setAvailability(availability);
        }
        if (categoryId != null) {
            Category category = getCategory(categoryId);
            product.setCategory(category);
        }

        try {
            return productRepository.save(product);
        } catch (DataIntegrityViolationException e) {
            log.error(e.getMessage());
            throw new DatabaseExceptionException("Product could not be updated: invalid data");
        } catch (DataAccessException e) {
            log.error(e.getMessage());
            throw new ProductNotSavedException("Product could not be saved");
        }
    }

    public Product updateImage(String productId, String imageBase64)
            throws ProductNotFoundException, ProductNotSavedException, DatabaseExceptionException {
        Product product = getProduct(productId);
        product.setImageBase64(imageBase64);

        try {
            return productRepository.save(product);
        } catch (DataIntegrityViolationException e) {
            log.error(e.getMessage());
            throw new DatabaseExceptionException("Product image could not be updated: invalid data");
        } catch (DataAccessException e) {
            log.error(e.getMessage());
            throw new ProductNotSavedException("Product could not be saved");
        }
    }

    public void deleteProduct(String productId) throws ProductNotFoundException, ProductNotSavedException {
        Product product = getProduct(productId);
        try {
            productRepository.delete(product);
        } catch (DataAccessException e) {
            log.error(e.getMessage());
            throw new ProductNotSavedException("Product could not be deleted");
        }
    }

    public Product getProduct(String productId) throws ProductNotFoundException {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found for id: " + productId));
    }

    public Product getProductAvailable(String productId) throws ProductNotFoundException {
        return productRepository.findByIdAndAvailabilityTrue(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found or not available for id: " + productId));
    }

    public List<Product> getProducts(Sort sort) {
        if (sort != null) {
            return productRepository.findAll(sort);
        }
        return productRepository.findAll();
    }

    public List<Product> getProductsAvailable(Sort sort) {
        if (sort != null) {
            return productRepository.findByAvailabilityTrue(sort);
        }
        return productRepository.findByAvailabilityTrue();
    }

    public List<Product> getProductsByCategory(Integer categoryId, Sort sort)
            throws CategoryNotFoundException {
        if (!categoryRepository.existsById(categoryId)) {
            throw new CategoryNotFoundException("Category not found for id: " + categoryId);
        }
        if (sort != null) {
            return productRepository.findByCategoryIdAndAvailabilityTrue(categoryId, sort);
        }
        return productRepository.findByCategoryIdAndAvailabilityTrue(categoryId);
    }

    public List<Product> getProductsByCategory(Integer categoryId) throws CategoryNotFoundException {
        return getProductsByCategory(categoryId, null);
    }

    public Category getCategory(Integer categoryId) throws CategoryNotFoundException {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found for id: " + categoryId));
    }

    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    public Category addCategory(String name, String description)
            throws DuplicateCategoryException, CategoryNotSavedException {
        if (categoryRepository.existsByName(name)) {
            throw new DuplicateCategoryException("Category already exists with name: " + name);
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        try {
            return categoryRepository.save(category);
        } catch (DataAccessException e) {
            log.error(e.getMessage());
            throw new CategoryNotSavedException("Category could not be saved");
        }
    }

    public void deleteCategory(Integer categoryId) throws CategoryNotFoundException, CategoryInUseException {
        Category category = getCategory(categoryId);
        if (productRepository.existsByCategoryId(categoryId)) {
            throw new CategoryInUseException("Category cannot be deleted because it has products");
        }
        try {
            categoryRepository.delete(category);
        } catch (DataAccessException e) {
            log.error(e.getMessage());
            throw new CategoryNotSavedException("Category could not be deleted");
        }
    }
}
