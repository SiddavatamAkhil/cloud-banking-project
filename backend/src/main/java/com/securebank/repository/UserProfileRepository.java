package com.securebank.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.securebank.model.UserProfile;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    // JpaRepository already provides findById method
}
