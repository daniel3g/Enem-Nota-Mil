'use client'

import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import NextImage from 'next/image'

type Props = {
  initialUrl?: string | null
}

export default function AvatarCropUpload({ initialUrl }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1) Ler arquivo local
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
    setError(null)
  }

  // 2) Guardar área do crop
  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels)
  }, [])

  // Util: criar <img> a partir de DataURL
  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })

  // 3) Recortar no canvas (quadrado)
  const getCroppedBlob = async (imgSrc: string, crop: any): Promise<Blob> => {
    const image = await createImage(imgSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = Math.round(crop.width)
    canvas.height = Math.round(crop.height)

    ctx.drawImage(
      image,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, canvas.width, canvas.height
    )

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', 0.9)
    })
  }

  // 4) Confirmar recorte, enviar ao backend e salvar no perfil
  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return
    try {
      setLoading(true)
      setError(null)

      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
      const file = new File([blob], `${Date.now()}.jpeg`, { type: 'image/jpeg' })

      const form = new FormData()
      form.append('file', file)

      // (a) upload para Supabase Storage (sua rota já faz isso)
      const up = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      const upJson = await up.json()
      if (!up.ok) throw new Error(upJson?.error || 'Falha no upload.')

      const avatar_url = upJson?.avatar_url as string

      // (b) persistir URL no seu perfil
      const patch = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url }),
      })
      if (!patch.ok) {
        const pj = await patch.json().catch(() => ({}))
        console.warn('Perfil não atualizado, mas upload ok:', pj)
      }

      // Atualiza preview local
      setPreviewUrl(avatar_url)
      setImageSrc(null)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar avatar.')
    } finally {
      setLoading(false)
    }
  }, [imageSrc, croppedAreaPixels])

  const reset = () => {
    setImageSrc(null)
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Avatar atual */}
      <div className="flex items-center gap-4">
        <div className="size-24 rounded-full overflow-hidden bg-gray-200">
          <NextImage
            src={previewUrl || '/avatar-default.png'}
            alt="Avatar"
            width={96}
            height={96}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-neutral-900 text-white"
          >
            Trocar foto
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="px-3 py-2 rounded-lg border"
            >
              Remover
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Modal/área de crop inline */}
      {imageSrc && (
        <div className="rounded-2xl overflow-hidden border">
          <div className="relative w-full max-w-md aspect-square bg-black/50">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"     // círculo visual
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={true}
            />
          </div>

          <div className="flex items-center gap-3 p-3">
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Confirmar recorte'}
            </button>
            <button onClick={reset} className="px-3 py-2 rounded-lg border">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
