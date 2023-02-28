# Backup

## Production

### Creation

Automatically created through k8s cronjob deployt through helm chart. See `/chart/templates/cronjob-backup.yaml`.

### Restore

First decompress the backup:

    $ zstd -d mongodb-backup-archive.zst

Then restore the collection to a new database

    $ mongorestore --archive="mongodb-backup-archive" --nsFrom='infinity-prod.*' --nsTo='backup-20201230.*' --verbose

You can also test the procedure with the `--dryRun` flag.