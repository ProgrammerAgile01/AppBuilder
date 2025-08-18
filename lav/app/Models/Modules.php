<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Modules extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected $table = 'modules';

    protected $fillable = [
        'name',
        'menu_title',
        // 'table_name',
        'description',
        'total_categories',
        'total_columns',
        'total_stat',
        'status',
        // 'module_group'
        // 'created_by',
        // 'updated_by',
        // 'deleted_by', // nanti
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
