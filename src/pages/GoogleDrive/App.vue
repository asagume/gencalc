<template>
  <h2>Google Drive 連携</h2>
  <p style="text-align: left; margin-left: 2rem;"><a href="./">げんかるく</a> </p>
  <p>本画面では、Google Driveのアプリデータフォルダを介して、ブラウザ間および端末間で《げんかるく》のデータを共有するための機能を提供します。</p>

  <div class="usage">
  </div>

  <div>
    <button type="button" @click="login" :disabled="!gapiInited">
      {{ isSignedIn ? 'リフレッシュ' : 'Googleでログイン' }}
    </button>
    <button type="button" @click="logoff" :disabled="!isSignedIn || isProcessing">ログアウト</button>
  </div>
  <br />

  <div>
    <button type="button" @click="handleListClick" :disabled="!isSignedIn || isProcessing">Google
      Drive上の退避データ一覧を取得</button>
  </div>

  <br />
  <table class="list-of-appdata">
    <caption>Google Drive上のアプリデータ</caption>
    <thead>
      <tr>
        <th>name</th>
        <th>modifiedTime</th>
        <th>size</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr :class="loaTrClass(item.id)" v-for="item in remoteFileList.filter(s => s.id !== undefined)" :key="item.id"
        @click="overwriteObject(selectedFile, item)">
        <td>{{ item.name }}</td>
        <td>{{ item.modifiedTime }}</td>
        <td>{{ item.size }}</td>
        <td>
          <button type="button" :disabled="isProcessing" @click="handleGetClick(item.id)">取得</button>
          <button type="button" :disabled="isProcessing" @click="handleDeleteClick(item.id)">削除</button>
        </td>
      </tr>
    </tbody>
  </table>

  <br />
  <br />
  <br />
  <div>
    <button type="button" @click="handleReloadLocalClick">ローカルデータ再読込</button>
    &nbsp;
    <button type="button" @click="handleExportClick" :disabled="!canExport || isProcessing">エクスポート</button>
    <button type="button" @click="handleImportClick" :disabled="!canImport || isProcessing">インポート</button>
  </div>
  <br />

  <table class="remote-appdata">
    <caption> ローカルデータと取得データの差分 </caption>
    <thead>
      <tr>
        <th>key</th>
        <th>status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="comparisonList.filter(s => s[1] != 0).length == 0">
        <td colspan="2">差分なし</td>
      </tr>
      <tr v-else v-for="comparison in comparisonList.filter(s => s[1] != 0)" :key="comparison[0]">
        <td>{{ comparison[0] }}</td>
        <td>{{ ['同値', '差異あり', 'ローカルのみ', 'リモートのみ'][comparison[1]] }}</td>
      </tr>
    </tbody>
  </table>
  <br />
  <hr />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import _ from "lodash";
import { googleSdkLoaded } from "vue3-google-login";
import { overwriteObject } from "@/common";
/// <reference path="../../node_modules/@types/gapi/index.d.ts" />

type TokenClientResponse = {
  access_token: string,
  expires_in: number,
  scope: string,
  token_type: string,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace gapi { }
export default defineComponent({
  name: "GoogleDrive",
  setup() {
    const CLIENT_ID = '507502242382-a7d868j5089106u313q7hd6js3i375l2.apps.googleusercontent.com';
    const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
    const API_KEY = 'AIzaSyCMehcHxbFkrej2jq_CT4TuAqQz01MTW6g';
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    const APPDATA_NAME = 'appdata_all.json';

    const gapiInited = ref(false);

    function initGapiClient() {
      console.log('initGapiClient');
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      }).then(() => {
        gapiInited.value = true;
      })
    }

    onMounted(() => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = async function () {
        gapi.load('client', {
          callback: function () {
            initGapiClient();
          },
          onerror: function () {
            alert('gapi.client failed to load!');
          },
          timeout: 30000, // 30 seconds
          ontimeout: function () {
            alert('gapi.client could not load in a timely manner!');
          },
        });
      };
      document.body.appendChild(script);
    })

    const tokenResponse = reactive({} as TokenClientResponse);
    const localAppdata = reactive({} as any);
    const remoteAppdata = reactive({} as any);
    const remoteFileList = reactive([] as any[]);
    const selectedFile = reactive({} as any);
    const downloadedFile = reactive({} as any);
    const isProcessing = ref(false);

    const isSignedIn = computed(() => {
      return tokenResponse.access_token ? true : false;
    })

    const comparisonList = computed(() => {
      const result: [string, number][] = [];
      const localKeys = Object.keys(localAppdata).sort();
      const remoteKeys = Object.keys(remoteAppdata).sort();
      localKeys.forEach(key => {
        if (remoteKeys.includes(key)) {
          if (_.isEqual(localAppdata[key], remoteAppdata[key])) {
            result.push([key, 0]); // 同値
          } else {
            result.push([key, 1]); // 差異あり
          }
        } else {
          result.push([key, 2]);  // ローカルのみ
        }
      })
      remoteKeys.filter(key => !localKeys.includes(key)).forEach(key => {
        result.push([key, 3]);  // リモートのみ
      })
      return result;
    })

    const isSameLocalAndRemote = computed(() => {
      return comparisonList.value.filter(e => e[1] != 0).length == 0;
    })

    const canExport = computed(() => {
      return !remoteAppdata || !isSameLocalAndRemote.value;
    })

    const canImport = computed(() => {
      return remoteAppdata && !isSameLocalAndRemote.value;
    })

    /** Googleでログイン */
    const login = () => {
      googleSdkLoaded(google => {
        google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          prompt: '',
          callback: response => {
            if (response.access_token) {
              console.log(response);
              tokenResponse.access_token = response.access_token;
              tokenResponse.expires_in = Number(response.expires_in);
              tokenResponse.scope = response.scope;
              tokenResponse.token_type = response.token_type;

              handleListClick();
              handleReloadLocalClick();
            }
          }
        }).requestAccessToken();
      });
    }

    /** サインアウト */
    const logoff = () => {
      if (tokenResponse.access_token) {
        googleSdkLoaded(google => {
          google.accounts.oauth2.revoke(tokenResponse.access_token);
        });
      }
      overrideObject(tokenResponse, {});
      overrideObject(remoteAppdata, {});
      remoteFileList.splice(0, remoteFileList.length);
      overrideObject(selectedFile, {});
      overrideObject(downloadedFile, {});
    }

    /** リモート(Google Drive)のAppdataの一覧を取得します */
    const handleListClick = async () => {
      await requestFilesList().then((response: any) => {
        console.log(response);
        if (response?.files && _.isArray(response.files)) {
          remoteFileList.splice(0, remoteFileList.length, ...response.files);
          console.log(remoteFileList);
        }
      });
      overrideObject(selectedFile, {});
    }

    /** リモート(Google Drive)のAppdataをダウンロードします */
    const handleGetClick = async (id?: string) => {
      const workId = id ? id : remoteFileList[0].id;
      await requestFilesGet(workId, { alt: 'media' }).then((response: any) => {
        if (response?.body) {
          const json = JSON.parse(response?.body);
          overrideObject(remoteAppdata, json);
          const workFileList = remoteFileList.filter(file => file.id == id);
          if (workFileList.length) {
            overrideObject(downloadedFile, workFileList[0]);
          }
        } else {
          overwriteObject(downloadedFile, {});
        }
      })
      handleReloadLocalClick();
    }

    /** リモート(Google Drive)のAppdataを削除します */
    const handleDeleteClick = async (id: string) => {
      if (!confirm('選択データをGoogle Driveから削除します。よろしいですか？')) {
        return;
      }
      await requestFilesDelete(id);
      await handleListClick();
      if (selectedFile && selectedFile.id == id) {
        overwriteObject(selectedFile, {});
      }
    }

    /** ローカルストレージのAppdataをリモート(Google Drive)にアップロードします */
    const handleExportClick = async () => {
      if (!confirm('Google Driveにアプリデータをアップロードします。よろしいですか？')) {
        return;
      }
      handleReloadLocalClick();
      await requestFilesCreate(APPDATA_NAME, localAppdata, 'application/json');
      await handleListClick();
      if (remoteFileList.length > 5) {
        const deleteList = [];
        for (let i = 5; i < remoteFileList.length; i++) {
          deleteList.push(remoteFileList[i].id);
        }
        await Promise.all(deleteList.map((fileId: any) => requestFilesDelete(fileId)));
        await handleListClick();
      }
    }

    /** ダウンロード済みのリモートのAppdataをローカルストレージにコピー(上書き)します */
    const handleImportClick = () => {
      if (!confirm('取得済のデータでアプリデータを上書きします。よろしいですか？')) {
        return;
      }
      overrideObject(localStorage, remoteAppdata);
      handleReloadLocalClick();
    }

    /** ローカルのAppdataをローカルストレージから再読み込みします */
    const handleReloadLocalClick = () => {
      overrideObject(localAppdata, localStorage);
    }

    const handleRemoveAllClick = async () => {
      const response: any = await requestFilesList();
      if (response?.files && _.isArray(response.files)) {
        remoteFileList.splice(0, remoteFileList.length, ...response.files);
        await Promise.all(response.files.map((file: any) => requestFilesDelete(file.id)));
      }
    }

    const overrideObject = (dst: object, src: object) => {
      Object.keys(dst).filter(key => !(key in src)).forEach(key => {
        delete (dst as any)[key];
      })
      Object.keys(src).forEach(key => {
        (dst as any)[key] = (src as any)[key];
      })
    }

    /**
     * files.create
     * 
     * @param name ファイルの名前
     * @param contentType Content-Type
     * @param params APIのパラメータ
     */
    async function requestFilesCreate(name: string, content: any, contentType: string, params?: any) {
      isProcessing.value = true;
      const boundary = '----====----====----';
      const workParams: any = {
        uploadType: 'multipart',
      };
      if (params) {
        Object.keys(params).forEach(key => {
          workParams[key] = params[key];
        });
      }
      const parts: [string, any, any][] = [];
      parts.push(['metadata', {
        name: name,
        parents: ['appDataFolder'],
      }, { 'Content-Type': 'application/json' }]);
      parts.push(['media', content, { 'Content-Type': contentType }]);

      try {
        const response = await gapi.client.request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: workParams,
          headers: {
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: makeMultipartBody(parts, boundary),
        });
        console.debug(response);
        return response;
      } catch (err) {
        handleGapiException(err);
      } finally {
        isProcessing.value = false;
      }
    }

    // /**
    //  * files.update
    //  * 
    //  * @param id ファイルのID
    //  * @param contentType Content-Type
    //  * @param params APIのパラメータ
    //  */
    // async function requestFilesUpdate(id: string, content: any, contentType: string, params?: any) {
    //   const boundary = '----====----====----';
    //   const workParams: any = {
    //     uploadType: 'multipart',
    //   };
    //   if (params) {
    //     Object.keys(params).forEach(key => {
    //       workParams[key] = params[key];
    //     });
    //   }
    //   const parts: [string, any, any][] = [];
    //   parts.push(['metadata', {}, { 'Content-Type': 'application/json' }]);
    //   parts.push(['media', content, { 'Content-Type': contentType }]);

    //   try {
    //     const response = await gapi.client.request({
    //       path: `/upload/drive/v3/files/${id}`,
    //       method: 'PATCH',
    //       params: workParams,
    //       headers: {
    //         'Content-Type': `multipart/related; boundary=${boundary}`
    //       },
    //       body: makeMultipartBody(parts, boundary),
    //     });
    //     console.debug(response);
    //     return response;
    //   } catch (err) {
    //     handleGapiException(err);
    //   }
    // }

    function makeMultipartBody(parts: [string, any, any][], boundary: string) {
      const result: string[] = [];
      parts.forEach(part => {
        const body = part[1];
        const headers = part[2];
        result.push(`--${boundary}`);
        Object.keys(headers).forEach(key => {
          result.push(`${key}: ${headers[key]}`);
        })
        result.push('');
        if (_.isString(body)) {
          result.push(body);
        } else if (_.isPlainObject(body)) {
          result.push(JSON.stringify(body));
        }
      })
      result.push(`--${boundary}--`);
      return result.join('\r\n');
    }

    /**
     * files.list
     * 
     * @param params APIのパラメータ
     */
    async function requestFilesList(params?: any) {
      isProcessing.value = true;
      const workParams: any = {
        orderBy: 'modifiedTime desc',
        pageSize: 20,
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name, modifiedTime, size)',
      };
      if (params) {
        Object.keys(params).forEach(key => {
          workParams[key] = params[key];
        });
      }
      try {
        const response = await gapi.client.request({
          path: 'drive/v3/files',
          method: 'GET',
          params: workParams,
        });
        console.debug(response);
        if (response.result) {
          return response.result;
        }
        throw response;
      } catch (err) {
        handleGapiException(err);
      } finally {
        isProcessing.value = false;
      }
    }

    /**
     * files.get
     * 
     * @param fileId ファイルのID
     * @param params APIのパラメータ
     */
    async function requestFilesGet(fileId: string, params?: any) {
      isProcessing.value = true;
      const workParams: any = {
      };
      if (params) {
        Object.keys(params).forEach(key => {
          workParams[key] = params[key];
        });
      }
      try {
        const response = await gapi.client.request({
          path: `drive/v3/files/${fileId}`,
          method: 'GET',
          params: workParams,
        });
        console.debug(response);
        return response;
      } catch (err) {
        handleGapiException(err);
      } finally {
        isProcessing.value = false;
      }
    }

    /**
     * files.delete
     * 
     * @param fileId ファイルのID
     * @param params APIのパラメータ
     */
    async function requestFilesDelete(fileId: string, params?: any) {
      isProcessing.value = true;
      const workParams: any = {
      };
      if (params) {
        Object.keys(params).forEach(key => {
          workParams[key] = params[key];
        });
      }
      try {
        const response = await gapi.client.request({
          path: `drive/v3/files/${fileId}`,
          method: 'DELETE',
          params: workParams,
        });
        console.debug(response);
        return response;
      } catch (err) {
        handleGapiException(err);
      } finally {
        isProcessing.value = false;
      }
    }

    function handleGapiException(err: unknown) {
      console.error(err);
      alert(err);

      overrideObject(tokenResponse, {});
      overrideObject(remoteAppdata, {});
      remoteFileList.splice(0, remoteFileList.length);
      overrideObject(selectedFile, {});
      overrideObject(downloadedFile, {});
    }

    const loaTrClass = (id: string) => {
      const classes = [];
      if (selectedFile && selectedFile.id == id) classes.push('selected');
      if (downloadedFile && downloadedFile.id == id) classes.push('downloaded');
      return classes.join(' ');
    }

    return {
      login,
      logoff,
      handleListClick,
      handleGetClick,
      handleDeleteClick,
      handleExportClick,
      handleImportClick,
      handleReloadLocalClick,
      handleRemoveAllClick,
      gapiInited,
      isSignedIn,
      isProcessing,
      comparisonList,
      canExport,
      canImport,

      remoteFileList,
      selectedFile,
      downloadedFile,
      loaTrClass,

      overwriteObject,
    };
  },
});
</script>
<style scoped>
div.usage {
  margin-left: auto;
  margin-right: auto;
  width: 60em;
  max-width: 90%;
}

div.usage dl {
  text-align: left;
}

table {
  margin-left: auto;
  margin-right: auto;
  min-width: 80%;
  table-layout: fixed;
  margin-bottom: 10px;
  border: 1px double gray;
}

th,
td {
  border: 1px solid gray;
}

th {
  background-color: cornflowerblue;
}

tr.selected {
  background-color: darkkhaki;
}

tr.downloaded {
  color: brown;
}

td button {
  width: 5em;
}
</style>
