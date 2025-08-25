<?php

namespace App\Builder;

use App\Builder\Contracts\ActionContract;

class ActionRegistry
{
    /** Ambil semua kelas aksi dari config lalu instansiasi */
    public static function all(): array
    {
        $classes = config('builder_actions.actions', []);
        return array_values(array_filter(array_map(function ($cls) {
            if (!class_exists($cls)) return null;
            $obj = app($cls);
            return $obj instanceof ActionContract ? $obj : null;
        }, $classes)));
    }

    /** Filter aksi berdasarkan entity + (opsional) posisi */
    public static function for(string $entity, ?string $position = null): array
    {
        return array_values(array_filter(self::all(), function (ActionContract $a) use ($entity, $position) {
            $entOk = in_array('*', $a->forEntities(), true) || in_array($entity, $a->forEntities(), true);
            $posOk = $position ? ($a->position() === $position) : true;
            return $entOk && $posOk;
        }));
    }

    /** Cari satu aksi berdasarkan key (mis: 'hello') */
    public static function find(string $entity, string $key): ?ActionContract
    {
        foreach (self::for($entity) as $a) {
            if ($a->key() === $key) return $a;
        }
        return null;
    }
}
