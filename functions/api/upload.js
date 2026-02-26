// 文件路径: /functions/api/upload/[[path]].js
export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. 认证（保持不变）
  const apiKey = request.headers.get('X-API-Key');
  const expectedApiKey = env.API_KEY;
  if (!expectedApiKey || apiKey !== expectedApiKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 解析表单数据
  const formData = await request.formData();
  const file = formData.get('file'); // 字段名假设为 'file'

  if (!file || typeof file === 'string') {
    return new Response(JSON.stringify({ error: '未上传文件或字段名无效。' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. 【新增】图片类型验证
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'image/x-icon', // .ico
    'image/heic',   // HEIC图片
    'image/heif',   // HEIF图片
    'image/avif'    // AVIF图片
  ];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico', '.heic', '.heif', '.avif'];

  // 检查MIME类型
  if (!allowedMimeTypes.includes(file.type)) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: `不支持的文件类型：${file.type || '未知'}。仅允许上传图片文件，支持格式：${allowedExtensions.join(', ')}。`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 可选：双重检查文件扩展名（更严格）
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: `不支持的文件扩展名。仅允许上传图片文件，支持格式：${allowedExtensions.join(', ')}。`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 4. 调用 K-Vault 原有的上传逻辑（此处需替换为实际函数）
  let uploadResult;
  try {
    // 【重要】请根据 K-Vault 源码，将 `handleKvaultUpload` 替换为实际的上传处理函数
    // 例如：uploadResult = await handleTelegramUpload(file, env, 'image');
    uploadResult = {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: `https://${new URL(request.url).hostname}/file/generated_${Date.now()}_${file.name}`,
      md5: 'simulated_md5_hash',
      storage: 'telegram', // 或根据请求参数/env配置决定
      isImage: true // 新增标记，便于前端识别
    };
  } catch (error) {
    console.error('Upload processing error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || '图片处理失败。'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 5. 返回 JSON 响应
  return new Response(JSON.stringify(uploadResult), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

// 6. 处理 OPTIONS 预检请求（保持不变）
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    }
  });
}