package com.smartseg.backend.service;

import com.smartseg.backend.exception.ResourceNotFoundException;
import com.smartseg.backend.model.User;
import com.smartseg.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Get ALL users (enabled and not enabled)
    public List<User> getAllUsersRegardlessOfStatus() {
        return userRepository.findAll();
    }

    // Get all pending users (enabled = false)
    public List<User> getPendingUsers() {
        return userRepository.findByEnabled(false);
    }

    // Get all approved users (enabled = true)
    public List<User> getApprovedUsers() {
        return userRepository.findByEnabled(true);
    }

    // Approve a user
    public User approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(true);
        return userRepository.save(user);
    }

    // Reject a user
    public void rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    // Get user by id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    // Delete user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}