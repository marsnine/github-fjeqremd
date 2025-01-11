-- 외부 플랫폼 재생목록 테이블 생성
CREATE TABLE IF NOT EXISTS public.external_playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    list_url TEXT NOT NULL,
    list_name TEXT NOT NULL,
    video_qty INTEGER DEFAULT 0,
    channel_url TEXT,
    channel_subscriber INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_url)
);

-- 외부 플랫폼 동영상 테이블 생성
CREATE TABLE IF NOT EXISTS public.external_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.external_playlists(id) ON DELETE CASCADE,
    video_link TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    origin_update TIMESTAMPTZ,
    target_update TIMESTAMPTZ DEFAULT NOW(),
    video_uuid UUID REFERENCES public.videos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(video_link)
);

-- 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 설정
CREATE TRIGGER update_external_playlists_updated_at
    BEFORE UPDATE ON public.external_playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_videos_updated_at
    BEFORE UPDATE ON public.external_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE public.external_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_videos ENABLE ROW LEVEL SECURITY;

-- external_playlists RLS 정책
CREATE POLICY "Users can view all playlists"
    ON public.external_playlists
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own playlists"
    ON public.external_playlists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
    ON public.external_playlists
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
    ON public.external_playlists
    FOR DELETE
    USING (auth.uid() = user_id);

-- external_videos RLS 정책
CREATE POLICY "Users can view all external videos"
    ON public.external_videos
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert external videos to their playlists"
    ON public.external_videos
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.external_playlists
            WHERE id = playlist_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update external videos in their playlists"
    ON public.external_videos
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.external_playlists
            WHERE id = playlist_id
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.external_playlists
            WHERE id = playlist_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete external videos from their playlists"
    ON public.external_videos
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.external_playlists
            WHERE id = playlist_id
            AND user_id = auth.uid()
        )
    );

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_external_playlists_user_id ON public.external_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_external_videos_playlist_id ON public.external_videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_external_videos_video_uuid ON public.external_videos(video_uuid);

-- 코멘트 추가
COMMENT ON TABLE public.external_playlists IS 'YouTube 같은 외부 플랫폼의 재생목록 정보';
COMMENT ON TABLE public.external_videos IS '외부 플랫폼의 재생목록에서 읽어들인 동영상 정보';