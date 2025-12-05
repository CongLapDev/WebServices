package com.nhs.individual.service.sub_service;

import com.nhs.individual.repository.sub_repository.ProductOverviewRepository;
import com.nhs.individual.views.ProductOverView;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ProductOverviewService {
    private ProductOverviewRepository productOverviewRepository;
    public Optional<ProductOverView> findById(Integer id) {
        return productOverviewRepository.findById(id);
    }
    public Page<ProductOverView> findAll(List<Specification<ProductOverView>> specifications, Pageable pageable) {
        if(specifications.isEmpty()) return productOverviewRepository.findAll(pageable);
        Specification<ProductOverView> spec = specifications.get(0);
        for (int i = 1; i < specifications.size(); i++) {
            spec = spec.and(specifications.get(i));
        }
        return productOverviewRepository.findAll(spec,pageable);
    }
}
