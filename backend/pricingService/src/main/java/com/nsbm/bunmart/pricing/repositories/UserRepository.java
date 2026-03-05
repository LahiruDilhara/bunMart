package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String userId);

    @Query("SELECT u.userSegment FROM User u WHERE u.userId = :userId")
    Optional<String> findUserSegmentByUserId(@Param("userId") String userId);
}