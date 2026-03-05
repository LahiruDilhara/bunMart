package com.nsbm.bunmart.userProfile.repositories;

import com.nsbm.bunmart.userProfile.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {

    List<Address> findByUserId(Integer userId);

    void deleteByUserId(Integer userId);
}
