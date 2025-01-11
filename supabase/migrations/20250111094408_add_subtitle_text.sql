ALTER TABLE videos
ADD COLUMN subtitle_text TEXT;

COMMENT ON COLUMN videos.subtitle_text IS '동영상의 자막 텍스트';