die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required : the path to the pgsql dump file"

psql --command "TRUNCATE users, recensements, objets, communes;" collectif_objets_dev
pg_restore --clean --if-exists --no-owner --no-privileges --no-comments --dbname collectif_objets_dev $1
