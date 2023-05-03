package de.kucera_server.wasmk3;

import static android.content.ContentValues.TAG;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void on(View view){
        changeStatus(true);
    }

    public void off(View view){
        changeStatus(false);
    }

    public void setDisabled(boolean disabled){
        ProgressBar status = (ProgressBar)findViewById(R.id.spinner);
        Button onBtn = (Button)findViewById(R.id.onButton);
        Button offBtn = (Button)findViewById(R.id.offButton);
        runOnUiThread(() -> {
            onBtn.setClickable(!disabled);
            offBtn.setClickable(!disabled);
            onBtn.setEnabled(!disabled);
            offBtn.setEnabled(!disabled);

            status.setVisibility(disabled ? View.VISIBLE : View.INVISIBLE);
        });
    }

    public void changeStatus(boolean status){
        new Thread(() -> {
            try{
                setDisabled(true);
                OkHttpClient client = new OkHttpClient(
                        new OkHttpClient.Builder()
                                .readTimeout(46, TimeUnit.SECONDS)
                );

                Request request = new Request.Builder()
                        .url("http://87.182.195.189:23542/"+ (status ? "on" : "off"))
                        .addHeader("password","5a3b24a1-af5d-45b0-ac9a-767fa595a81f")
                        .build();
                showMessage("Changing Status");
                Response res = client.newCall(request).execute();
                if (res.code() == 200){
                    showMessage(res.message());
                }else{
                    showMessage(res.body().string());
                }
            }catch (Exception e){
                showMessage(e.toString());
                Log.d(TAG, e.getMessage());
            } finally {
                setDisabled(false);
            }
        }).start();
    }

    private void showMessage(String msg){
        runOnUiThread(() -> {
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
        });
    }
}