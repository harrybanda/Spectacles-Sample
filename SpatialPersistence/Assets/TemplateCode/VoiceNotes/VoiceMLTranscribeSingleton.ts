import { Singleton } from "../../SpectaclesInteractionKit/Decorators/Singleton";
import Event, { PublicApi } from "../../SpectaclesInteractionKit/Utils/Event";

@Singleton
export class VoiceMLTranscribeSingleton {
  public static getInstance: () => VoiceMLTranscribeSingleton;

  private listening = false;
  private didInitialise = false;
  private targetTextField: Text = null;

  private voiceMLOptions = VoiceML.ListeningOptions.create();
  private voiceMLModule: VoiceMLModule;

  private onTranscriptionFinalizedEvent: Event<void> = new Event<void>();
  readonly onTranscriptionFinalized: PublicApi<void> =
    this.onTranscriptionFinalizedEvent.publicApi();

  constructor() {}

  init(module: VoiceMLModule) {
    if (this.didInitialise) {
      print("VoiceMLTranscribeSingleton. Tried to initialize twice");
      return;
    }

    this.voiceMLModule = module;

    this.voiceMLModule.onListeningUpdate.add((evt) => {
      if (evt.transcription.trim() == "") {
        return;
      }

      if (this.targetTextField) {
        this.targetTextField.text = evt.transcription;
      }

      if (evt.isFinalTranscription) {
        this.onTranscriptionFinalizedEvent.invoke();
      }

      print("Transcription: " + evt.transcription);
      print("Is final Transcription: " + evt.isFinalTranscription);
    });

    this.didInitialise = true;
  }

  startListening(newTargetTextField: Text) {
    if (!this.didInitialise) {
      print("VoiceMLTranscribeSingleton. Tried to listen before initializing");
      return;
    }
    this.targetTextField = newTargetTextField;
    this.voiceMLModule.startListening(this.voiceMLOptions);
    this.listening = true;
  }

  stopListening() {
    this.voiceMLModule.stopListening();
    this.listening = false;
  }
}
