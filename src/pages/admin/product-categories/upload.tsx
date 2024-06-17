// pages/admin/productCategories/upload.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Container, Typography } from '@mui/material';
import { toast } from 'react-toastify';

const UploadProductCategories = () => {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('ファイルを選択してください');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/private/admin/product-categories/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('CSVファイルのアップロードが成功しました');
        router.push('/admin/product-categories');
      } else {
        toast.error('CSVファイルのアップロードに失敗しました');
      }
    } catch (error) {
      toast.error('アップロード中にエラーが発生しました');
      console.error(error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        商品区分のCSVアップロード
      </Typography>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        アップロード
      </Button>
    </Container>
  );
};

export default UploadProductCategories;
