// components/Sidebar.tsx
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import RecipeIcon from '@mui/icons-material/Receipt';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div>
      <List>
        <ListItem button component={Link} href="/admin/stores">
          <ListItemIcon><StoreIcon /></ListItemIcon>
          <ListItemText primary="ストア管理" />
        </ListItem>
        <ListItem button component={Link} href="/admin/recipes">
          <ListItemIcon><RecipeIcon /></ListItemIcon>
          <ListItemText primary="レシピ管理" />
        </ListItem>
        {/* 必要に応じて他のメニューアイテムを追加 */}
      </List>
    </div>
  );
};

export default Sidebar;
