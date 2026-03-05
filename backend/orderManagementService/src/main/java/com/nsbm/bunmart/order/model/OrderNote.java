package com.nsbm.bunmart.order.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_note")
public class OrderNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String note;

    private LocalDateTime createdAt = LocalDateTime.now();

    public OrderNote() {
    }

    public OrderNote(String note) {
        this.note = note;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
