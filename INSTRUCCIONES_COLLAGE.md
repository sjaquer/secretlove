# 📸 Instrucciones para el Collage de Fotos

## 🎵 Paso 1: Agregar la Música

1. Descarga la canción **"Kikuo - Hizashi wa Tsukanoma"** desde Spotify o YouTube
2. Guarda el archivo como: `Kikuo - Hizashi wa Tsukanoma.mp3`
3. Colócalo en la carpeta: `public/`

## 🖼️ Paso 2: Agregar tus Fotos

1. Prepara tus fotos en dos formatos:
   - **Cuadradas (1:1)**: Para fotos tipo Instagram, retratos, etc.
   - **Horizontales (16:9)**: Para fotos panorámicas, paisajes, etc.

2. Renombra tus fotos como:
   - `collage-1.jpg`
   - `collage-2.jpg`
   - `collage-3.jpg`
   - `collage-4.jpg`
   - `collage-5.jpg`
   - `collage-6.jpg`

3. Colócalas en la carpeta: `public/`

## ✏️ Paso 3: Personalizar los Mensajes

1. Abre el archivo: `src/app/collage/page.tsx`
2. Busca la sección `MEMORIES` (línea ~15)
3. Cambia los mensajes en el campo `message` por tus propios textos
4. Ajusta el `type` de cada foto:
   - `"square"` para fotos 1:1
   - `"wide"` para fotos 16:9

Ejemplo:

```typescript
{
  id: 1,
  src: "/collage-1.jpg", 
  type: "square" as const,
  message: "Tu mensaje aquí...",
  rotation: -2
}
```

## 🔓 Paso 4: Acceder a la Página

1. Ve a la página principal de tu app
2. Introduce el código secreto: **HEX9821**
3. ¡Disfruta tu collage!

---

## 🎨 Personalización Adicional

### Agregar más fotos

Simplemente agrega más objetos al array `MEMORIES` siguiendo el mismo formato.

### Cambiar rotación de polaroids

Modifica el valor de `rotation` (entre -3 y 3 funciona bien).

### Ajustar volumen de la música

En el archivo `page.tsx`, línea ~74, cambia:

```typescript
audioRef.current.volume = 0.5; // Valores de 0.0 a 1.0
```

---

**¡Listo! Tu collage personalizado está preparado.** 💝
