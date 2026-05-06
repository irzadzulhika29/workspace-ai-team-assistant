-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "judul" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "chat_type" TEXT,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama_file" TEXT NOT NULL,
    "kategori" TEXT,
    "file_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT "dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "n8n_chat_histories" (
    "id" SERIAL NOT NULL,
    "session_id" UUID NOT NULL,
    "message" JSONB NOT NULL,

    CONSTRAINT "n8n_chat_histories_pkey" PRIMARY KEY ("id")
);
