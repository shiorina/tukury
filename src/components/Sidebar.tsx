import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import RecipeIcon from '@mui/icons-material/Receipt';
import IngredientIcon from '@mui/icons-material/Kitchen';
import CategoryIcon from '@mui/icons-material/Category';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div style={{ width: 250 }}>
      <List>
        <ListItem button component={Link} href="/admin">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="ホーム" />
        </ListItem>
        <ListItem button component={Link} href="/admin/stores">
          <ListItemIcon><StoreIcon /></ListItemIcon>
          <ListItemText primary="ストア管理" />
        </ListItem>
        <ListItem button component={Link} href="/admin/recipes">
          <ListItemIcon><RecipeIcon /></ListItemIcon>
          <ListItemText primary="レシピ管理" />
        </ListItem>
        <ListItem button component={Link} href="/admin/items">
          <ListItemIcon><IngredientIcon /></ListItemIcon>
          <ListItemText primary="食材管理" />
        </ListItem>
        <ListItem button component={Link} href="/admin/product-categories">
          <ListItemIcon><CategoryIcon /></ListItemIcon>
          <ListItemText primary="商品区分管理" />
        </ListItem>
        <Link href="/admin/store-products" passHref>
          <ListItem>
            <ListItemIcon><StoreIcon /></ListItemIcon>
            <ListItemText primary="ストア取扱商品" />
          </ListItem>
        </Link>
        <Link href="/admin/store-product-prices" passHref>
          <ListItem>
            <ListItemIcon><StoreIcon /></ListItemIcon>
            <ListItemText primary="商品価格" />
          </ListItem>
        </Link>
      </List>
    </div>
  );
};

export default Sidebar;
