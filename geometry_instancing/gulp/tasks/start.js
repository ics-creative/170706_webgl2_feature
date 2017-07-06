/**
 * ローカルサーバーの起動、ファイルウォッチ用のタスク
 *
 * @author ICS-Kano
 */
// 設定ファイル
const config = require("../../build_config")
const taskName = require("../taskName")
const browserSync = require("browser-sync")

require("./tsCompile")
require("./tsLint")

const gulp = require("gulp")

/**
 * ローカルサーバーのタスク設定
 */
gulp.task(taskName.start,
  gulp.series(
    gulp.parallel(
      taskName.tsLint,
      taskName.tsCompile
    ),
    () => {
      startWatchTasks()
    }
  )
)

/**
 * ウォッチタスクを開始します。
 */
function startWatchTasks() {
  browserSync({
    server: {
      baseDir: "src" // ルートとなるディレクトリを指定
    }
  })

  // jsファイルを監視
  gulp.watch(`${config.jsFolder}/**/*.js`, (done) => {
    // ファイルに変更があれば同期しているブラウザをリロード
    browserSync.reload()
    // リロード終了時に実行
    done()
  })

  // TypeScriptファイルのウォッチ
  gulp.watch(`${config.tsFolder}/**/*.ts`,
    gulp.parallel(
      taskName.tsLint,  // Lint
      taskName.tsCompile  // コンパイル
    )
  )
}