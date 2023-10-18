import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

function CameraComponent() {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [resultData, setResultData] = useState(null);
  const alist=[];

  const handleCapture = (target) => {
    if (target.files && target.files.length !== 0) {
      // // API 엔드포인트 URL 설정
      // const apiUrl = 'http://192.168.0.105:8080'; //서버 호스팅 시 주소 바꿀 것
      
      const file = target.files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];
        // 서버로 사진 데이터 전송 및 예측 결과 받기
        const predictionResults = await sendPhotoToServer(base64Image);
        console.log(predictionResults);
      };
      reader.readAsDataURL(file);
      setSource(URL.createObjectURL(file));

      // getUserLocation();
    }
  };



  const sendPhotoToServer = async (base64Data) => {
    try {
      // API 엔드포인트 URL 설정
      const apiUrl = 'https://detectjyjy.pythonanywhere.com/'; //서버 호스팅 시 주소 바꿀 것
      
      // 서버로 전송할 데이터 객체 생성
      const dataToSend = { image: base64Data };
      console.log("dataToSend:",dataToSend);
      // POST 요청으로 데이터 전송 및 응답 받기
      const response = await fetch(apiUrl + '/predict', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
     });

     if (!response.ok) throw new Error('Failed to send photo to server.');

     // 응답 데이터 처리
     const resultData = await response.json();

     console.log("resultData:",resultData);
     
     if (resultData && resultData.predictions){
      const names = resultData.predictions.map((prediction)=>prediction.name);
      const confidences = resultData.predictions.map((prediction)=>prediction.confidence);
      
      console.log('건물 명: ', names);
      alist.push(names);
      console.log('인식률: ',confidences);

      setResultData(resultData);

      return resultData;
    }
     
     // 결과를 활용하여 화면에 표시하거나 추가 작업 수행
     
   } catch (error) {
     console.log('Error sending photo to server:', error);
   }
  };

  const handleResultView = async () =>{
    if(resultData && resultData.predictions) {
      const names = resultData.predictions.map((prediction) => prediction.name);
      const confidences = resultData.predictions.map((prediction) => prediction.confidence);
      
      navigate( '/result',
        {state : {names:names, confidences:confidences}}
      );
    }
  };
  // //사용자의 위치 정보 요청
  // const getUserLocation = () => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       position => {
  //         const latitude = position.coords.latitude;
  //         const longitude = position.coords.longitude;
  //         console.log('사용자 위치:', latitude, longitude);

  //         // 서버로 위치 정보 전송 및 처리
  //         sendLocationToServer(latitude, longitude);
  //       },
  //       error => {
  //         console.error('위치 정보를 가져오는 중 오류가 발생했습니다:', error);
  //       }
  //     );
  //   } else {
  //     console.error('브라우저에서 Geolocation을 지원하지 않습니다.');
  //   }
  // };


  return (
    <div style={{  justifyContent: "center", textAlign:"center"}}>
  <div>
    <h1 style={{color:'#215017', textAlign:'center'}}>LooKU</h1>
    <div className='buttonCollection'>
    {source && (
      <div className='imageContainer'>
        <img src={source} alt="snap" className='image' />
      </div>
    )}
    
      <div className='filebox'>
          <label for="file">
          <div class="btn-upload">건물 촬영하기</div>
          </label>
          <input
          accept="image/*"
          type="file"
          capture="environment"
          onChange={(e) => handleCapture(e.target)}
          id="file"
        />
        </div>
        
        <label htmlFor="icon-button-file">
          <button onClick={handleResultView} className='resultViewButton'>
            건물 인식하기
            {/* 아이콘을 사용하는 경우 */}

          </button>
        </label>

    </div>
        
  </div>
</div>
  );
}


export default CameraComponent;
