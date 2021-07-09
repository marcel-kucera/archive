import {
  AppBar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  GridList,
  makeStyles,
  Paper,
  Toolbar,
  Typography,
  useTheme,
} from "@material-ui/core";
import React, { useState } from "react";

export default function Home() {
  const styles = makeStyles({
    main: {
      maxWidth: "70%",
      margin: "auto",
      marginTop: useTheme().spacing(1),
      padding: useTheme().spacing(2),
    },
    card: {
      width: "100%",
    },
  })();

  const [dialog, setDialog] = useState(false);
  const posts = ["post1", "fdksla", "gjkf"];
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4">memes</Typography>
          <Grid spacing={1} container justify="flex-end">
            <Grid item>
              <Button onClick={() => setDialog(true)}>Register</Button>
            </Grid>
            <Grid item>
              <Button>Login</Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      <Paper classes={{ root: styles.main }}>
        <Typography variant="h3">Posts</Typography>
        <Grid container spacing={1} direction="column">
          {posts.map((el) => (
            <Grid item classes={{ root: styles.card }}>
              <Card>
                <CardHeader title={el}></CardHeader>
                <CardContent>
                  <Typography>yeah boi</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={dialog} onClose={() => setDialog(false)}>
        <DialogTitle>Well, this is a thing!</DialogTitle>
        <DialogContent>
          <DialogContentText>bitch molasses</DialogContentText>
          <Typography>stenography</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
