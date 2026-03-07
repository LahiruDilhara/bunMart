package com.nsbm.bunmart.userProfile.dto;

/**
 * Address in profile response (frontend expects street, not line1/line2).
 */
public class ProfileAddressDTO {

    private String id;
    private String type;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    public ProfileAddressDTO() {
    }

    public ProfileAddressDTO(String id, String type, String street, String city, String state, String postalCode, String country) {
        this.id = id;
        this.type = type;
        this.street = street;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}
