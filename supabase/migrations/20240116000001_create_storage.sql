-- Enable the storage extension
create extension if not exists "storage" schema "extensions";

-- Create a storage bucket for videos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  52428800, -- 50MB in bytes
  array['video/*']::text[]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array['video/*']::text[];

-- Set up storage policies
create policy "Videos are publicly accessible"
on storage.objects for select
using (bucket_id = 'videos');

create policy "Authenticated users can upload videos"
on storage.objects for insert
with check (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own videos"
on storage.objects for update
using (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own videos"
on storage.objects for delete
using (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
