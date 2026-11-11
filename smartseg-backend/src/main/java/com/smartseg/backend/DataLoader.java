package com.smartseg.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.smartseg.backend.model.User;
import com.smartseg.backend.repository.UserRepository;
/*
@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataLoader(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

   /* @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            //userRepository.save(new User(null,"doctor@smartseg.com","123456","doctor"));
            //userRepository.save(new User(null,"tech@smartseg.com","123456","technician"));
           // userRepository.save(new User(null,"admin@smartseg.com","123456","admin"));
        }
    }*/
