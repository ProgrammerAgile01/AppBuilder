<?php

use Illuminate\Support\Facades\Route;

Route::get('{entity}/export-pdf', [\App\Http\Controllers\Export\ExportPdfController::class, 'export'])->name('pdf.export');
// Route for data-kendaraans
Route::get('data-kendaraans/actions', [\App\Http\Controllers\Overrides\DataKendaraanController::class, 'listActions']);
Route::match(['GET','POST'], 'data-kendaraans/actions/{actionKey}', [\App\Http\Controllers\Overrides\DataKendaraanController::class, 'runAction']);
Route::get('data-kendaraans/export-excel', [\App\Http\Controllers\Generate\DataKendaraanController::class, 'exportExcel']);
Route::apiResource('data-kendaraans', \App\Http\Controllers\Overrides\DataKendaraanController::class);
Route::get('fitur/tree', [\App\Http\Controllers\Generate\FeatureBuilderController::class, 'index']);
Route::apiResource('fitur', \App\Http\Controllers\Generate\FeatureBuilderController::class);

// Route for data-pegawais
Route::get('data-pegawais/actions', [\App\Http\Controllers\Overrides\DataPegawaiController::class, 'listActions']);
Route::match(['GET','POST'], 'data-pegawais/actions/{actionKey}', [\App\Http\Controllers\Overrides\DataPegawaiController::class, 'runAction']);
Route::get('data-pegawais/export-excel', [\App\Http\Controllers\Generate\DataPegawaiController::class, 'exportExcel']);
Route::apiResource('data-pegawais', \App\Http\Controllers\Overrides\DataPegawaiController::class);
// == menus_START ==
use App\Http\Controllers\Generate\MenuController;

Route::get('menus/tree', [MenuController::class, 'tree']);
Route::post('menus/reorder', [MenuController::class, 'reorder']);
Route::post('menus/{id}/restore', [MenuController::class, 'restore']);
Route::delete('menus/{id}/force', [MenuController::class, 'forceDelete']);
Route::apiResource('menus', MenuController::class);
// == menus_END ==










// Route for data-customers
Route::get('data-customers/actions', [\App\Http\Controllers\Overrides\DataCustomerController::class, 'listActions']);
Route::match(['GET','POST'], 'data-customers/actions/{actionKey}', [\App\Http\Controllers\Overrides\DataCustomerController::class, 'runAction']);
Route::get('data-customers/export-excel', [\App\Http\Controllers\Generate\DataCustomerController::class, 'exportExcel']);
Route::apiResource('data-customers', \App\Http\Controllers\Overrides\DataCustomerController::class);