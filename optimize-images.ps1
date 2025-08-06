Add-Type -AssemblyName System.Drawing

# Define image quality for JPEG compression (0-100)
$jpegQuality = 85

# Path to your images
$sourcePath = "c:\Users\yuval\grimgrimberg.github.io\assets\images"
$destPath = "c:\Users\yuval\grimgrimberg.github.io\assets\images\optimized"

# Ensure destination directory exists
if (!(Test-Path -Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
}

# Get all JPG files
$imageFiles = Get-ChildItem -Path $sourcePath -Filter "*.jpg"

foreach ($file in $imageFiles) {
    # Skip if file is in the optimized folder
    if ($file.FullName -like "*\optimized\*") {
        continue
    }
    
    $outputPath = Join-Path -Path $destPath -ChildPath $file.Name
    
    try {
        # Load the image
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Calculate new dimensions (maintain aspect ratio)
        $maxWidth = 1200
        $maxHeight = 1200
        
        $ratioX = $maxWidth / $img.Width
        $ratioY = $maxHeight / $img.Height
        $ratio = [Math]::Min($ratioX, $ratioY)
        
        $newWidth = [int]($img.Width * $ratio)
        $newHeight = [int]($img.Height * $ratio)
        
        # Create a new bitmap with the new dimensions
        $bmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graph = [System.Drawing.Graphics]::FromImage($bmp)
        
        # Set the resolution for the new image
        $graph.Clear([System.Drawing.Color]::White)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        
        # Draw the resized image
        $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        # Set up the quality parameters
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $jpegQuality)
        
        # Get the JPEG codec
        $jpegCodecInfo = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        
        # Save the bitmap to a file
        $bmp.Save($outputPath, $jpegCodecInfo, $encoderParams)
        
        # Clean up
        $graph.Dispose()
        $bmp.Dispose()
        $img.Dispose()
        
        $originalSize = (Get-Item $file.FullName).Length / 1KB
        $newSize = (Get-Item $outputPath).Length / 1KB
        $reduction = 100 - ($newSize / $originalSize * 100)
        
        Write-Host "Processed $($file.Name): Original: $([Math]::Round($originalSize, 2)) KB, Optimized: $([Math]::Round($newSize, 2)) KB, Reduced by $([Math]::Round($reduction, 2))%"
    }
    catch {
        Write-Host "Error processing $($file.Name): $_"
    }
}

Write-Host "Image optimization complete!"
