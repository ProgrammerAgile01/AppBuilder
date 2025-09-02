<?php

use Illuminate\Support\Facades\Route;

Route::get('{entity}/export-pdf', [\App\Http\Controllers\Export\ExportPdfController::class, 'export'])->name('pdf.export');
// == menus_START ==
use App\Http\Controllers\Generate\MenuController;

Route::get('menus/tree', [MenuController::class, 'tree']);
Route::post('menus/reorder', [MenuController::class, 'reorder']);
Route::post('menus/{id}/restore', [MenuController::class, 'restore']);
Route::delete('menus/{id}/force', [MenuController::class, 'forceDelete']);
Route::apiResource('menus', MenuController::class);
// == menus_END ==
