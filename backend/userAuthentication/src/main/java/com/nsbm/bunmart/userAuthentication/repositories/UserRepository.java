package com.nsbm.bunmart.userAuthentication.repositories;

import com.nsbm.bunmart.userAuthentication.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    long countByBlocked(boolean blocked);
}
