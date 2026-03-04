package com.swisssigner.model;

import java.io.Serializable;

public class SignatoryPlacement implements Serializable {
    private String signatoryId;
    private int page;
    private int x;
    private int y;
    private int width;
    private int height;

    public SignatoryPlacement() {}

    public SignatoryPlacement(String signatoryId, int page, int x, int y, int width, int height) {
        this.signatoryId = signatoryId;
        this.page = page;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public String getSignatoryId() { return signatoryId; }
    public void setSignatoryId(String signatoryId) { this.signatoryId = signatoryId; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getX() { return x; }
    public void setX(int x) { this.x = x; }
    public int getY() { return y; }
    public void setY(int y) { this.y = y; }
    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }
    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }
}
