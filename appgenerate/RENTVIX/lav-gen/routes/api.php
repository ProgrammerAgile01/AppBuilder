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
