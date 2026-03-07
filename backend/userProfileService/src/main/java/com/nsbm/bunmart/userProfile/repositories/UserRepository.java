package com.nsbm.bunmart.userProfile.repositories;

import com.nsbm.bunmart.userProfile.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByAuthUserId(String authUserId);

    boolean existsByEmail(String email);
}
