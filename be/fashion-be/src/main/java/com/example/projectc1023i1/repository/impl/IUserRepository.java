package com.example.projectc1023i1.repository.impl;


import com.example.projectc1023i1.model.Users;
import com.example.projectc1023i1.request.UpdateUserRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<Users, Integer> {
    @Query(value = "SELECT * FROM users u WHERE u.username = :number", nativeQuery = true)
    Optional<Users> findByUsername (@Param("number") String username);
    @Query(value = "SELECT * FROM users u WHERE u.number_phone = :number", nativeQuery = true)
    Optional<Users> findByNumberphone(@Param("number") String number);
    Boolean existsByEmail(String email);
    Optional<Users> findByEmail(String email);
    Boolean existsByNumberphone(String numberphone);
    @Query(value = "select u from Users u")
    Page<Users> getAllUser(Pageable pageable);
    @Transactional
    @Modifying
    @Query(value = "update Users as u set u.imgUrl = :param1 where u.numberphone = :param2")
    void updateImage(@Param("param1") String param1, @Param("param2") String param2);

    Boolean existsByUsername(String username);
//    @Query(value = "")
//    void updateProfile(UpdateUserRequest user, Integer userId);

}
