program PublishSSMCmd;

{$APPTYPE CONSOLE}

{$R *.res}

uses
  Logger,
  LogFile,
  LogConsole,
  StdIni,
  imb4,

  CommandQueue,
  TilerControl,

  PublishServerLib,
  PublishServerGIS,
  PublishServerSSM,

  System.Classes,
  System.SysUtils;

procedure HandleException(aConnection: TConnection; aException: Exception);
begin
  Log.WriteLn('FATAL IMB4 connection exception: '+aException.Message, llError);
end;

procedure HandleDisconnect(aConnection: TConnection);
begin
  Log.WriteLn('DISCONNECT from IMB4 connection', llWarning);
end;


(*
procedure sendFileEen(aProject: TProject; aClient: TClient; const aName: string);
var
  stream: TFileStream;
begin
  stream := TFileStream.Create('C:\Temp\Ecodistrict Bart L uploads\5e henk TDBP_14122016_PGN_GeoJSON2.csv', fmOpenRead);
  try
    aCLient.SendDownloadableFileStream({aName, }ExtractFileName(stream.FileName), stream);
  finally
    stream.Free;
  end;
end;
*)

var
  imbConnection: TConnection;
  sessionModel: TSessionModel;
  tilerFQDN: string;

  //mapView: TMapView;
  project: TSSMProject;
  simParameters: TSSMSimulationParameterList;
  //piSSM: Integer;

  { SSM/US
  piUSSSM: Integer;
  usDBConnection: TCustomConnection;
  scenario: TScenario;
  layer: TLayer;
  }
begin
  FileLogger.SetLogDef(AllLogLevels, [llsTime]);
  try
    // todo: change to tls connection

    imbConnection := TSocketConnection.Create('PublishSSM',98, 'OTS_RT', 'vps17642.public.cloudvps.com', 4004);//,'OTS_RT',GetSetting('RemoteHost', ''),GetSetting('RemotePort', '4004').ToInteger());
    try
      imbConnection.onException := HandleException;
      imbConnection.onDisconnect := HandleDisconnect;
      sessionModel := TSessionModel.Create(imbConnection);
      try
        tilerFQDN := GetSetting(TilerNameSwitch, DefaultTilerName);
        Log.WriteLn('Tiler name: '+tilerFQDN);
        // ssm module
        // mapView := TMapView.Create(52.08457, 4.88909, 14); // woerden
        // mapView := TMapView.Create(52.08606, 5.17689, 11); // loenen a/d vecht?


        {piSSM := }
        // DTV
        // SWECO
        // TUD


        // test project
        (*
        simParameters := TSSMSimulationParameterList.Create;
        simParameters.setParameter('models', 'DataStore;KPI Model;Demo Model');
        simParameters.setParameter('Undefined model name-testparam', 5);

        project := TSSMProject.Create(sessionModel, imbConnection,
          'SSM2', 'SSM2',
          tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)),
          nil, 0, false, false, false, True, false,
          simParameters,
          '[{"formElement":"input","type":"string","required":"y","optionsArray":false,"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
           '{"formElement":"select","type":"int","required":"y","optionsArray":[["0","0%"],["20","20%"],["40","40%"],["60","60%"],["80","80%"],["100","100%"]],"labelText":"percentage fcd vehicles","idName":"fcd","extraOptions":false}]',
          TMapView.Create(52.313939, 4.683429, 14), 0);
        sessionModel.Projects.Add(project);
        *)


        // build sweco project
        // US: V?
        simParameters := TSSMSimulationParameterList.Create;
        simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);Noise(RD);gtu2fcd;KPI Model;Demo Model;VissimController');
        //simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);gtu2fcd;KPI Model;Demo Model;VissimController');
        //simParameters.setParameter('models', 'DataStore;'{Traffic (SSM);Air (SSM <-> US)} + ';gtu2fcd;KPI Model;Demo Model;VissimController');
        simParameters.setParameter('DataStore-Description', '<scenarioName>');

        //simParameters.setParameter('Traffic (SSM)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');
        //simParameters.setParameter('Air (SSM <-> US)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');

        // todo:
        simParameters.setParameter('Undefined model name-testparam', 5);

        project := TSSMProject.Create(sessionModel, imbConnection,
          'sweco', 'Eindhoven - Smart Traffic with floating car data',
          tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)), nil, false,
          simParameters,
          '[{"formElement":"input","type":"string","required":"y","optionsArray":false,"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
           '{"formElement":"select","type":"int","required":"y","optionsArray":[["0","0%"],["20","20%"],["40","40%"],["60","60%"],["80","80%"],["100","100%"]],"labelText":"percentage fcd vehicles","idName":"fcd","extraOptions":false}, '+
           '{"formElement":"radio","type":"string","required":"y","optionsArray":["Yes", "No"],"labelText":"Record Simulation:","idName":"datasourcerecord","extraOptions":{"checked":"No"}}]',
          TMapView.Create(51.45485, 5.51492, 15), 0,
          'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde',
          'V2');
        sessionModel.Projects.Add(project);



        simParameters := TSSMSimulationParameterList.Create;
        //simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);SSMAirModule;KPI Model;VissimController');
        simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);Noise(RD);SSMAirModule;KPI Model;VissimController');
        //simParameters.setParameter('models', 'DataStore;'{Traffic (SSM);Air (SSM <-> US);} + 'SSMAirModule;KPI Model;VissimController');

        simParameters.setParameter('DataStore-Description', '<scenarioName>');

        simParameters.setParameter('VissimController-penetration', '<penetration>');
        simParameters.setParameter('VissimController-compliance rate', '<compliance rate>');
        simParameters.setParameter('VissimController-OD Matrix', '<OD Matrix>');
        simParameters.setParameter('VissimController-DTV case', True);

        //simParameters.setParameter('Traffic (SSM)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');
        //simParameters.setParameter('Air (SSM <-> US)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');

        // build dtv project
        project := TSSMProject.Create(sessionModel, imbConnection,
            'dtv', 'Eindhoven - ODYSA INCAR',
            tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)), nil, false,
            simParameters,
            '[{"formElement":"input","type":"string","required":"y","optionsArray":false,'+
             '"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
             '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"penetration rate","idName":"penetration","extraOptions":[1, "%"]},'+
             '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"compliance rate","idName":"compliance rate","extraOptions":[1, "%"]},'+
             '{"formElement":"select", "type":"string", "required":"y", '+
              '"optionsArray":[["odsay", "ODYSA basic"], '+
                              '["odsay", "ODYSA+primary-second"], '+
                              '["odsay", "ODYSA-primary+second"]], '+
              '"labelText":"Origin Destination matrix", "idName":"OD Matrix", "extraOptions":false}, ' +
              '{"formElement":"radio","type":"string","required":"y","optionsArray":["Yes", "No"],"labelText":"Record Simulation:","idName":"datasourcerecord","extraOptions":{"checked":"No"}}]',
            TMapView.Create(51.452348852281155, 5.505394935607911, 15), 0,
            'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde',
            'V4');
        sessionModel.Projects.Add(project);


        // build tud project
        simParameters := TSSMSimulationParameterList.Create;
        //simParameters.setParameter('models', 'DataStore;SSMAirModule;A58 model');
        //simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);SSMAirModule;A58 model');
        simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);Noise(RD);SSMAirModule;A58 model');
        simParameters.setParameter('DataStore-Description', '<scenarioName>');
        simParameters.setParameter('A58 model-penetration', '<penetration>');


        //simParameters.setParameter('Traffic (SSM)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');
        //simParameters.setParameter('Air (SSM <-> US)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');


        // US: V3
        project := TSSMProject.Create(sessionModel, imbConnection,
          'tud', 'A58 - CACC and schockwaves on the A58 between Tilburg and Eindhoven',
          tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)), nil, false,
          simParameters,
          '[{"formElement":"input","type":"string","required":"y","optionsArray":false,"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
           '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"penetration","idName":"penetration","extraOptions":[1, "%"]},'+
           '{"formElement":"radio","type":"string","required":"y","optionsArray":["Yes", "No"],"labelText":"Record Simulation:","idName":"datasourcerecord","extraOptions":{"checked":"No"}}]',
          TMapView.Create(51.5275, 5.25729, 13), 0,
          'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde',
          'V3');
        sessionModel.Projects.Add(project);


        {
        mapView := TMapView.Create(52.313939, 4.683429, 14); //  N201 bij schiphol
        sessionModel.Projects.Add(
          TSSMProject.Create(sessionModel, imbConnection,
            'SSM', 'N201',
            tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)), nil, 0, false, false, false, True, false, mapView, 0));
        }


        { ssm with us
        usDBConnection := ConnectToUSProject('us_schiedam_2016/us_schiedam_2016@app-usdata01.tsn.tno.nl/uspsde', 'us_schiedam_2016', mapView);
        mapView := getUSMapView(usDBConnection as TOraSession, );
        mapView := getUSMapView(usDBConnection as TOraSession, );

        piUSSSM := sessionModel.Projects.Add(
          TUSProject.Create(
            sessionModel,
            imbConnection,
            'USSSM',
            'USSSM',
            tilerFQDN,
            GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)),
            usDBConnection,
            mapView,
            False,
            GetSetting(MaxNearestObjectDistanceInMetersSwitch, DefaultMaxNearestObjectDistanceInMeters)));

        // add US layer to ssm
        for scenario in (sessionModel.Projects[piUSSSM]as TSSMProject).scenarios.Values do
        begin
          for layer in scenario.Layers.Values do
          begin
            sessionModel.Projects[piSSM].scenarios.Values.ToArray[0].Layers.Add(layer.ID, layer);
          end;
        end;
        }

        simParameters := TSSMSimulationParameterList.Create;
        simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);Noise(RD);SSMAirModule;KPI Model;VissimController');
        //simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);SSMAirModule;KPI Model;VissimController');
        //simParameters.setParameter('models', 'DataStore;'{Traffic (SSM);Air (SSM <-> US);} + 'SSMAirModule;KPI Model;VissimController');

        simParameters.setParameter('DataStore-Description', '<scenarioName>');
        {
        simParameters.setParameter('VissimController-penetration', '<penetration>');
        simParameters.setParameter('VissimController-compliance rate', '<compliance rate>');
        simParameters.setParameter('VissimController-OD Matrix', '<OD Matrix>');
        simParameters.setParameter('VissimController-JUNO case', True);
        simParameters.setParameter('VissimController-Simulation Time Start(hh:mm:ss)', '00:00:00');
        simParameters.setParameter('VissimController-Simulation Duration', 3600);
        simParameters.setParameter('VissimController-Period', '<traffic period>');//todo
        }
        simParameters.setParameter('VissimController-penetration', '<penetration>');
        simParameters.setParameter('VissimController-compliance rate', '1');
        simParameters.setParameter('VissimController-OD Matrix', 'JUNO N470_3');
        simParameters.setParameter('VissimController-JUNO case', True);
        simParameters.setParameter('VissimController-Simulation Time Start(hh:mm:ss)', '16:45:00');
        simParameters.setParameter('VissimController-Simulation Duration', 3600);
        simParameters.setParameter('VissimController-Period', 'avond');//todo

        //simParameters.setParameter('Traffic (SSM)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');
        //simParameters.setParameter('Air (SSM <-> US)-DataSource', 'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde');


        // US: V3
//          '[{"formElement":"input","type":"string","required":"y","optionsArray":false,"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
//          '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"penetration rate","idName":"penetration","extraOptions":[1, "%"]},'+
//             '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"compliance rate","idName":"compliance rate","extraOptions":[1, "%"]},'+
//             '{"formElement":"select", "type":"string", "required":"y", '+
//              '"optionsArray":[["JUNO N470_3", "juno"], '+
//                              '["JUNO N470_1", "juno VA"], '+
//                              '["JUNO N470_0", "juno uncontrolled"]], '+
//              '"labelText":"Juno case", "idName":"OD Matrix", "extraOptions":false}, ' +
//              '{"formElement":"select", "type":"string", "required":"y", '+
//              '"optionsArray":[["Etmaal", "Basis"], '+
//                              '["avond", "Avond"], '+
//                              '["Middag", "Middag"]], '+
//              '"labelText":"Traffic Selection", "idName":"traffic period", "extraOptions":false}, ' +
//              '{"formElement":"radio","type":"string","required":"y","optionsArray":["Yes", "No"],"labelText":"Record Simulation:","idName":"datasourcerecord","extraOptions":{"checked":"No"}}]',

        project := TSSMProject.Create(sessionModel, imbConnection,
          'juno', 'Juno N470 use case',
          tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)), nil, false,
          simParameters,
          '[{"formElement":"input","type":"string","required":"y","optionsArray":false,"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
          '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"penetration rate","idName":"penetration","extraOptions":[1, "%"]},'+
          '{"formElement":"radio","type":"string","required":"y","optionsArray":["Yes", "No"],"labelText":"Record Simulation:","idName":"datasourcerecord","extraOptions":{"checked":"No"}}]',
          TMapView.Create(51.98805165731394, 4.3596839904785165, 15), 0,
          'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde',
          'V5');
        sessionModel.Projects.Add(project);

        //CACC on the A2
        simParameters := TSSMSimulationParameterList.Create;
        simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);Noise(RD);SSMAirModule;KPI Model;VissimController');
        //simParameters.setParameter('models', 'SSMModel');
        //simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);SSMAirModule;KPI Model;VissimController');
        //simParameters.setParameter('models', 'DataStore;'{Traffic (SSM);Air (SSM <-> US);} + 'SSMAirModule;KPI Model;VissimController');

        simParameters.setParameter('DataStore-Description', '<scenarioName>');
        simParameters.setParameter('VissimController-penetration', '<penetration>');
        simParameters.setParameter('VissimController-randomseed', '<randomseed>');
        simParameters.setParameter('VissimController-compliance rate', '1');
        simParameters.setParameter('VissimController-A2 case', True);

        project := TSSMProject.Create(sessionModel, imbConnection,
          'a2', 'CACC on the A2 use case',
          tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)), nil, false,
          simParameters,
          '[{"formElement":"input","type":"string","required":"y","optionsArray":false,"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
          '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"penetration rate","idName":"penetration","extraOptions":[1, "%"]},'+
          '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"random seed","idName":"randomseed","extraOptions":[1, ""]},'+
          '{"formElement":"radio","type":"string","required":"y","optionsArray":["Yes", "No"],"labelText":"Record Simulation:","idName":"datasourcerecord","extraOptions":{"checked":"No"}}]',
          TMapView.Create(51.787807, 5.3098297, 12), 0,
          'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde',
          'V6'); //todo: correct US-prefix
        sessionModel.Projects.Add(project);

//        project.addDownloadableFile('file een', sendFileEen);
//        project.addDownloadableFile('file twee', nil);

        //aimsum
        simParameters := TSSMSimulationParameterList.Create;
        //simParameters.setParameter('models', 'aimsun');

        //simParameters.setParameter('models', 'DataStore;Traffic (SSM);Air (SSM <-> US);Noise(RD);SSMAirModule;KPI Model;VissimController');

        //simParameters.setParameter('DataStore-Description', '<scenarioName>');
        //simParameters.setParameter('VissimController-penetration', '<penetration>');
        //simParameters.setParameter('VissimController-randomseed', '<randomseed>');
        //simParameters.setParameter('VissimController-compliance rate', '1');
        //simParameters.setParameter('VissimController-A2 case', True);

        project := TSSMProject.Create(sessionModel, imbConnection,
          'aimsun', 'aimsun test case',
          tilerFQDN, GetSetting(TilerStatusURLSwitch, TilerStatusURLFromTilerName(tilerFQDN)), nil, false,
          simParameters,
          '[{"formElement":"input","type":"string","required":"y","optionsArray":false,"labelText":"Scenario name","idName":"scenarioName","extraOptions":false},'+
          '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"penetration rate","idName":"penetration","extraOptions":[1, "%"]},'+
          '{"formElement":"slider","type":"float","required":"y","optionsArray":["0", "100"],"labelText":"random seed","idName":"randomseed","extraOptions":[1, ""]},'+
          '{"formElement":"radio","type":"string","required":"y","optionsArray":["Yes", "No"],"labelText":"Record Simulation:","idName":"datasourcerecord","extraOptions":{"checked":"No"}}]',
          TMapView.Create(41.406076, 2.160037, 11), 0,
          'us_simsmartmobility/us_simsmartmobility@app-usdata01.tsn.tno.nl/uspsde',
          'V6'); //todo: correct US-prefix
        sessionModel.Projects.Add(project);

        // every project has own listener for clients -> global list not needed anymore
        {
        // inquire existing session and rebuild internal sessions..
        imbConnection.subscribe(imbConnection.privateEventName, False).OnIntString.Add(
          procedure(event: TEventEntry; aInt: Integer; const aString: string)
          var
            projectEventPrefix: string;
            p: TProject;
          begin
            // find project with client
            for p in sessionModel.Projects do
            begin
              projectEventPrefix := p.ProjectEvent.eventName+'.';
              if aString.StartsWith(projectEventPrefix) then
              begin
                p.addClient(aString.Split(['&'])[0]);
                Log.WriteLn('linked existing client: '+aString.Substring(projectEventPrefix.Length));
                Log.WriteLn('to project: '+p.ProjectName, llNormal, 1);
                exit;
              end;
            end;
            Log.WriteLn('could not link existing ws2imb client to project: '+aString, llWarning);
          end);

        // inquire existing sessions
        imbConnection.publish(WS2IMBEventName, False).signalIntString(actionInquire, imbConnection.privateEventName);
        }
        // main loop
        WriteLn('Press return to quit');
        ReadLn;

      finally
        //todo: unclaim models?
        FinalizeCommandQueue();
        sessionModel.Free;
      end;
    finally
      imbConnection.Free;
    end;
  except
    on E: Exception do
      Log.Writeln(E);
  end;
end.
