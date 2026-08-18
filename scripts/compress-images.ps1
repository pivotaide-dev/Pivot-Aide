
Add-Type -AssemblyName System.Drawing
$oversized = @('blog-82.png', 'blog-83.png', 'blog-84.png', 'blog-85.png', 'blog-86.png', 'blog-87.png')
foreach ($f in $oversized) {
    $path = Join-Path 'blog-images' $f
    $bmp = [System.Drawing.Bitmap]::new($path)
    $w = 1536
    $h = [int]($bmp.Height * ($w / $bmp.Width))
    $newBmp = [System.Drawing.Bitmap]::new($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($bmp, 0, 0, $w, $h)
    $g.Dispose()
    $bmp.Dispose()
    $tempPath = Join-Path 'blog-images' ('temp_' + $f)
    $newBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBmp.Dispose()
    Move-Item -Force $tempPath $path
    $size = (Get-Item $path).Length / 1MB
    Write-Host "$f resized and compressed: $([math]::Round($size, 2)) MB"
}
