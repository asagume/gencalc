<template>
  <h2>Google Drive 連携</h2>
  <h3>テスト中</h3>
  <p><a href="./">Back to げんかるく</a> </p>
  <p>本画面では、Google Driveのアプリデータフォルダを介して、ブラウザ間および端末間で《げんかるく》のデータを共有するための機能を提供します。</p>

  <div>
    <button type="button" @click="login" :disabled="!gapiInited">Googleでログイン</button>
    <button type="button" @click="logoff" :disabled="!isSignedIn">ログアウト</button>
  </div>

  <div>
    <button type="button" @click="handleListClick" :disabled="!isSignedIn">List remote files</button>
  </div>

  <table class="list-of-appdata">
    <tr>
      <th>name</th>
      <th>modifiedTime</th>
      <th>size</th>
    </tr>
    <tr :class="loaTrClass(item.id)" v-for="item in remoteFileList" :key="item.id"
      @click="overwriteObject(selectedFile, item)">
      <td>{{ item.name }}</td>
      <td>{{ item.modifiedTime }}</td>
      <td>{{ item.size }}</td>
      <td>
        <button type="button" @click="handleGetClick(item.id)">取得</button>
        <button type="button" @click="handleDeleteClick(item.id)">削除</button>
      </td>
    </tr>
  </table>

  <div>
    <button type="button" @click="handleReloadLocalClick">更新</button>
    &nbsp;
    <button type="button" @click="handleExportClick" :disabled="!canExport">エクスポート</button>
    <button type="button" @click="handleImportClick" :disabled="!canImport">インポート</button>
  </div>

  <table class="remote-appdata">
    <caption v-if="downloadedFile.id"> {{
      'name:' + downloadedFile.name + ' modifiledTime:' + downloadedFile.modifiedTime + ' size:' + downloadedFile.size
    }} </caption>
    <tr>
      <th>key</th>
      <th>status</th>
    </tr>
    <tr v-for="comparison in comparisonList" :key="comparison[0]">
      <td>{{ comparison[0] }}</td>
      <td>{{ ['同値', '差異あり', 'ローカルのみ', 'リモートのみ'][comparison[1]] }}</td>
    </tr>
  </table>
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
  name: "VueGoogle",
  setup() {
    const CLIENT_ID = '507502242382-a7d868j5089106u313q7hd6js3i375l2.apps.googleusercontent.com';
    const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
    const API_KEY = 'AIzaSyCMehcHxbFkrej2jq_CT4TuAqQz01MTW6g';
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    const APPDATA_NAME = 'appdata_all.json';

    const gapiInited = ref(false);

    function initGapiClient() {
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
    })

    const tokenResponse = reactive({} as TokenClientResponse);
    const localAppdata = reactive({} as any);
    const remoteAppdata = reactive({} as any);
    const remoteFileList = reactive([] as any[]);
    const selectedFile = reactive({} as any);
    const downloadedFile = reactive({} as any);

    const isSignedIn = computed(() => {
      return tokenResponse.access_token ? true : false;
    })

    const comparisonList = computed(() => {
      const result: [string, number][] = [];
      const localKeys = Object.keys(localAppdata).sort();
      const remoteKeys = Object.keys(remoteAppdata).sort();
      localKeys.forEach(key => {
        if (key in remoteKeys) {
          if (_.isEqual(localAppdata[key], remoteAppdata[key])) {
            result.push([key, 0]); // 同値
          } else {
            result.push([key, 1]); // 差異あり
          }
        } else {
          result.push([key, 2]);  // ローカルのみ
        }
      })
      remoteKeys.filter(key => !(key in localKeys)).forEach(key => {
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
        if (response?.files && _.isArray(response.files)) {
          remoteFileList.splice(0, remoteFileList.length, ...response.files);
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
          overwriteObject(downloadedFile, response);
        } else {
          overwriteObject(downloadedFile, {});
        }
      })
    }

    /** リモート(Google Drive)のAppdataを削除します */
    const handleDeleteClick = async (id: string) => {
      await requestFilesDelete(id);
      await handleListClick();
      if (selectedFile && selectedFile.id == id) {
        overwriteObject(selectedFile, {});
      }
    }

    /** ローカルストレージのAppdataをリモート(Google Drive)にアップロードします */
    const handleExportClick = async () => {
      reloadLocalAppdata();
      await requestFilesCreate(APPDATA_NAME, localAppdata, 'application/json');
      await handleListClick();
    }

    /** ダウンロード済みのリモートのAppdataをローカルストレージにコピー(上書き)します */
    const handleImportClick = () => {
      overrideObject(localStorage, remoteAppdata);
    }

    const handleReloadLocalClick = () => {
      reloadLocalAppdata();
    }

    const handleRemoveAllClick = async () => {
      const response: any = await requestFilesList();
      if (response?.files && _.isArray(response.files)) {
        remoteFileList.splice(0, remoteFileList.length, ...response.files);
        await Promise.all(response.files.forEach((file: any) => requestFilesDelete(file.id)));
      }
    }

    /** ローカルのAppdataをローカルストレージから再読み込みします */
    const reloadLocalAppdata = () => {
      overrideObject(localAppdata, localStorage);
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
      }
    }

    /**
     * files.update
     * 
     * @param id ファイルのID
     * @param contentType Content-Type
     * @param params APIのパラメータ
     */
    async function requestFilesUpdate(id: string, content: any, contentType: string, params?: any) {
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
      parts.push(['metadata', {}, { 'Content-Type': 'application/json' }]);
      parts.push(['media', content, { 'Content-Type': contentType }]);

      try {
        const response = await gapi.client.request({
          path: `/upload/drive/v3/files/${id}`,
          method: 'PATCH',
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
      }
    }

    function makeMultipartBody(parts: [string, any, any][], boundary: string) {
      const result: string[] = [];
      parts.forEach(part => {
        const name = part[0];
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
      const workParams: any = {
        orderBy: 'modifiedTime desc',
        pageSize: 10,
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
        return response;
      } catch (err) {
        handleGapiException(err);
      }
    }

    /**
     * files.get
     * 
     * @param fileId ファイルのID
     * @param params APIのパラメータ
     */
    async function requestFilesGet(fileId: string, params?: any) {
      const workParams: any = {
        alt: 'media',
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
      }
    }

    /**
     * files.delete
     * 
     * @param fileId ファイルのID
     * @param params APIのパラメータ
     */
    async function requestFilesDelete(fileId: string, params?: any) {
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
table {
  min-width: 80%;
  table-layout: fixed;
}

tr.selected {
  background-color: darkkhaki;
}

tr.downloaded {
  color: brown;
}
</style>
