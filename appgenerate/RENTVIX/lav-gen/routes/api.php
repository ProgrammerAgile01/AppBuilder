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





// Route for daftar-kendaraans
Route::get('daftar-kendaraans/actions', [\App\Http\Controllers\Overrides\DaftarKendaraanController::class, 'listActions']);
Route::match(['GET','POST'], 'daftar-kendaraans/actions/{actionKey}', [\App\Http\Controllers\Overrides\DaftarKendaraanController::class, 'runAction']);
Route::get('daftar-kendaraans/export-excel', [\App\Http\Controllers\Generate\DaftarKendaraanController::class, 'exportExcel']);
Route::apiResource('daftar-kendaraans', \App\Http\Controllers\Overrides\DaftarKendaraanController::class);
Route::get('/daftar-kendaraans-deleted', [\App\Http\Controllers\Overrides\DaftarKendaraanController::class, 'deletedData']);
Route::post('/daftar-kendaraans/restore/{id}', [\App\Http\Controllers\Overrides\DaftarKendaraanController::class, 'restore']);
Route::delete('/daftar-kendaraans/force/{id}', [\App\Http\Controllers\Overrides\DaftarKendaraanController::class, 'forceDelete']);