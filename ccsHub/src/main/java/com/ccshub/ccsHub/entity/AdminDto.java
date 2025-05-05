package com.ccshub.ccsHub.entity;

public class AdminDto {

    private String username;
    private String role;
    private int userId;
    private String password;

    public AdminDto() {
    }

    public AdminDto(String username, String role, int userId, String password) {
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}