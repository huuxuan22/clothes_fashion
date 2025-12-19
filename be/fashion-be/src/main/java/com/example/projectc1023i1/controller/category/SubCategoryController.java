package com.example.projectc1023i1.controller.category;

import com.example.projectc1023i1.Dto.SubCategoriesDTO;
import com.example.projectc1023i1.Dto.SubCategoryDTO;
import com.example.projectc1023i1.Dto.get_data.category_mapstruck.CategoryMapper;
import com.example.projectc1023i1.model.Categories;
import com.example.projectc1023i1.model.SubCategories;
import com.example.projectc1023i1.mapper.ValidationErrorMapper;
import com.example.projectc1023i1.respone.errorsValidate.CategoriesErrorsRespone;
import com.example.projectc1023i1.respone.errorsValidate.CreateSubCateErrors;
import com.example.projectc1023i1.service.SubCategoryService;
import com.example.projectc1023i1.service.impl.ICategoriesService;
import com.example.projectc1023i1.service.impl.ISubCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategory/")
public class SubCategoryController {
    @Autowired
    private ISubCategoryService subCategoryService;
    @Autowired
    private ICategoriesService categoriesService;
    @Autowired
    private ValidationErrorMapper validationErrorMapper;
    @PostMapping("create")
    public ResponseEntity<?> createSubCategory(@Valid @RequestBody SubCategoriesDTO categoryDTO,
                                               BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            CreateSubCateErrors errors = validationErrorMapper.mapToCreateSubCateErrors(bindingResult);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }
        SubCategories subCategories = new SubCategories();
        subCategories.setSubCategoryName(categoryDTO.getSubCategoryName());
        subCategories.setCategories(categoriesService.findById(categoryDTO.getCategoriesId()).get());
        subCategoryService.saveSubCategory(subCategories);
        return ResponseEntity.ok().build();
    }

    @GetMapping("category/{categoryId}")
    public ResponseEntity<?> getSubCategory(@PathVariable("categoryId") Long categoryId) {
        List<SubCategories> subCategories = subCategoryService.findByCategoryId(categoryId);
        return ResponseEntity.status(HttpStatus.OK).body(subCategories);
    }

    @GetMapping("/category/subCategory")
    public ResponseEntity<?> getSubCategoryBySubCategory(@RequestParam("size") Integer size,
                                                         @RequestParam("page") Integer page) {
        Pageable pageable = PageRequest.of(size,page);
        Page<SubCategories> categoriesPage = subCategoryService.getAllSubCategories(pageable);
        return ResponseEntity.status(HttpStatus.OK).body(categoriesPage);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addSubCategory(@RequestBody SubCategoryDTO categoriesDTO) {
        subCategoryService.addSubCategory(categoriesDTO);
        return ResponseEntity.status(HttpStatus.OK).body("Oke");
    }


    @DeleteMapping("/categoryId")
    public ResponseEntity<?> delete (@RequestParam("subCategoryId") Long subCategoryId ) {
        subCategoryService.deleteSubCategories(subCategoryId);
        return ResponseEntity.status(HttpStatus.OK).body("Oke");
    }

    @GetMapping("/category")
    public ResponseEntity<?> getSubCategoryByCategory() {
        List<CategoryMapper> categories = categoriesService.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(categories);
    }
}
