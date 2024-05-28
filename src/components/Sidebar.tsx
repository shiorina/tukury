import { List, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import RecipeIcon from '@mui/icons-material/Receipt';
import IngredientIcon from '@mui/icons-material/Kitchen';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div style={{ width: 250 }}>
      <List>
        <ListItemButton component={Link} href="/admin">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="ホーム" />
        </ListItemButton>
        <ListItemButton component={Link} href="/admin/stores">
          <ListItemIcon><StoreIcon /></ListItemIcon>
          <ListItemText primary="ストア管理" />
        </ListItemButton>
        <ListItemButton component={Link} href="/admin/recipes">
          <ListItemIcon><RecipeIcon /></ListItemIcon>
          <ListItemText primary="レシピ管理" />
        </ListItemButton>
        <ListItemButton component={Link} href="/admin/items">
          <ListItemIcon><IngredientIcon /></ListItemIcon>
          <ListItemText primary="食材管理" />
        </ListItemButton>
      </List>
    </div>
  );
};

export default Sidebar;
