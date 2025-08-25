<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Overrides\VehiclesController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::apiResource('pelanggans', App\Http\Controllers\Generate\PelanggansController::class);
Route::apiResource('level_users', App\Http\Controllers\Generate\LevelUserController::class);
Route::apiResource('user_managements', App\Http\Controllers\Generate\UserManagementController::class);
Route::apiResource('access_control_matrices', App\Http\Controllers\Generate\AccessControlMatrixController::class);

Route::get('{entity}/export-pdf', [\App\Http\Controllers\Export\ExportPdfController::class, 'export'])->name('pdf.export');
Route::get('vehicles/actions', [VehiclesController::class, 'listActions']);
Route::match(['GET','POST'], 'vehicles/actions/{actionKey}', [VehiclesController::class, 'runAction']);
Route::get('vehicles/export-excel', [\App\Http\Controllers\Generate\VehiclesController::class, 'exportExcel']);
Route::apiResource('vehicles', VehiclesController::class);