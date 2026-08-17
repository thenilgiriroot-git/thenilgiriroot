drop policy if exists "Public read email-assets" on storage.objects;

create policy "Public read email-assets files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'email-assets' and name = 'logo.png');