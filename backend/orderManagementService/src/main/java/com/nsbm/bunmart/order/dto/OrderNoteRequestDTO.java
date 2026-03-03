package com.nsbm.bunmart.order.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderNoteRequestDTO {

    @NotBlank(message = "Note cannot be blank")
    private String note;

    public OrderNoteRequestDTO() {
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
