<?php

use App\Http\Controllers\CrudBuilderController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ModulesController;
use App\Http\Controllers\PackageBuilderController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\FeatureBuilderController;
use App\Http\Controllers\TemplateFrontendController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// modules
Route::apiResource('modules', ModulesController::class);
Route::post('/modules/restore/{id}', [ModulesController::class, 'restore']);
// Route::delete('/modules/force/{id}', [ModulesController::class, 'forceDelete']);
Route::get('/total-modules', [ModulesController::class, 'totalModules']);

// crud builder
Route::apiResource('/builder', CrudBuilderController::class);
Route::get('/total-builder', [CrudBuilderController::class, 'totalBuilder']);
Route::get('/builder-tables', [CrudBuilderController::class, 'getBuilderTables']);
Route::get('/builder-columns/{table}', [CrudBuilderController::class, 'getBuilderColumns']);
Route::post('/builder/generate/{id}', [CrudBuilderController::class, 'generate']);
Route::get('/builder-deleted', [CrudBuilderController::class, 'deletedBuilder']);
Route::post('/builder/restore/{id}', [CrudBuilderController::class, 'restore']);
Route::delete('/builder/force/{id}', [CrudBuilderController::class, 'forceDelete']);

// template frontend
Route::apiResource('template-frontend', TemplateFrontendController::class);
Route::post('template-frontend/{id}/restore', [TemplateFrontendController::class, 'restore']);
Route::delete('template-frontend/{id}/force', [TemplateFrontendController::class, 'forceDelete']);


// menu setting
Route::apiResource('menus', MenuController::class);
Route::post('/menus/{id}/restore', [MenuController::class, 'restore']);       // restore soft-deleted
Route::delete('/menus/{id}/force', [MenuController::class, 'forceDelete']);

// routes/api.php
Route::post('/generate-menu', [MenuController::class, 'generateMenu']);

// Additional menu routes
Route::post('menus/reorder', [MenuController::class, 'reorder']);
Route::patch('menus/{id}/toggle-active', [MenuController::class, 'toggleActive']);
Route::get('menus/type/{type}', [MenuController::class, 'getByType']);

// Package Builder:
Route::apiResource('package', PackageBuilderController::class);


// Soft-delete ops
Route::post('packages/{package}/restore', [PackageBuilderController::class, 'restore']);
Route::delete('packages/{package}/force', [PackageBuilderController::class, 'forceDelete']);

// (Opsional) nested endpoint by menu, tetap boleh ada
Route::get('menus/{menu}/packages', [PackageBuilderController::class, 'indexByMenu']);

//Product
Route::apiResource('products', ProductController::class);

// Tambahan untuk trash
Route::post('products/{id}/restore', [ProductController::class, 'restore']);
Route::delete('products/{id}/force', [ProductController::class, 'forceDelete']);
// (Opsional) create parent + children sekaligus
Route::post('packages-with-children', [PackageBuilderController::class, 'storeWithChildren']);

// Atur Fitur
Route::get('fitur/tree', [FeatureBuilderController::class, 'tree']);
Route::get('fitur/trash-box', [FeatureBuilderController::class, 'trashBox']);
Route::post('fitur/generate/{productId}', [FeatureBuilderController::class, 'generate']);

Route::apiResource('fitur', FeatureBuilderController::class);
Route::post('fitur/{id}/toggle', [FeatureBuilderController::class, 'toggle']);
Route::post('fitur/{id}/restore', [FeatureBuilderController::class, 'restore']);
Route::delete('fitur/{id}/force', [FeatureBuilderController::class, 'force']);

// // Fitur Builder
// Route::apiResource('feature-builders', FeatureBuilderController::class);