package com.ccshub.ccsHub.repository;

import com.ccshub.ccsHub.entity.Merchandise;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class MerchandiseRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Merchandise> getMerchandise() {
        String sql = "SELECT * FROM merchandise ORDER BY id";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Merchandise merchandise = new Merchandise();
            merchandise.setId(rs.getInt("id"));
            merchandise.setName(rs.getString("name"));
            merchandise.setDescription(rs.getString("description"));
            merchandise.setPrice(rs.getDouble("price"));
            merchandise.setStock(rs.getInt("stock"));
            merchandise.setImage(rs.getBytes("image")); 
            return merchandise;
        });
    }
    

    public Merchandise getMerchandise(int id) {
        String sql = "SELECT * FROM merchandise WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum) -> {
            Merchandise merchandise = new Merchandise();
            merchandise.setId(rs.getInt("id"));
            merchandise.setName(rs.getString("name"));
            merchandise.setDescription(rs.getString("description"));
            merchandise.setPrice(rs.getDouble("price"));
            merchandise.setStock(rs.getInt("stock"));
            merchandise.setImage(rs.getBytes("image")); // ✅ reads BYTEA properly
            return merchandise;
        });
    }

    public List<Merchandise> searchMerchandise(String keyword) {
        String sql = "SELECT * FROM merchandise WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? ORDER BY id";
        String searchPattern = "%" + keyword.toLowerCase() + "%";

        return jdbcTemplate.query(sql, new Object[]{searchPattern, searchPattern}, (rs, rowNum) -> {
            Merchandise merchandise = new Merchandise();
            merchandise.setId(rs.getInt("id"));
            merchandise.setName(rs.getString("name"));
            merchandise.setDescription(rs.getString("description"));
            merchandise.setPrice(rs.getDouble("price"));
            merchandise.setStock(rs.getInt("stock"));
            merchandise.setImage(rs.getBytes("image"));
            return merchandise;
        });
    }

    public Merchandise createMerchandise(Merchandise merchandise) {
        String sql = "INSERT INTO merchandise (description, name, price, stock, image) " +
                     "VALUES (?, ?, ?, ?, ?) RETURNING id";
    
        Integer id = jdbcTemplate.queryForObject(sql, Integer.class,
                merchandise.getDescription(),
                merchandise.getName(),
                merchandise.getPrice(),
                merchandise.getStock(),
                merchandise.getImage());
    
        if (id != null) {
            return getMerchandise(id);
        }
    
        return null;
    }
    
    public Merchandise updateMerchandise(Merchandise merchandise){
        String sql = "UPDATE merchandise SET description=?, name=?, price=?, stock=?, image=? WHERE id=?";
        jdbcTemplate.update(sql, merchandise.getDescription(), merchandise.getName(),
                merchandise.getPrice(), merchandise.getStock(),merchandise.getImage(), merchandise.getId());

        return getMerchandise(merchandise.getId());
    }

    public void deleteMerchandise(int id){
        String sql = "DELETE FROM merchandise WHERE id=?";
        jdbcTemplate.update(sql,id);
    }
}
