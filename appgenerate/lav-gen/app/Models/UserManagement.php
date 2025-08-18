<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserManagement extends Model
{
    protected $table = 'user_management';
    protected $fillable = [
        'nama',
        'email',
        'nomor_telp',
        'role',
        'status',
        'foto'
    ];
    
    
    public function role() {
        return $this->belongsTo(\App\Models\LevelUser::class, 'role');
    }

    
    public function getFotoUrlAttribute()
    {
        return $this->foto
            ? asset('storage/' . $this->foto)
            : null;
    }

}
