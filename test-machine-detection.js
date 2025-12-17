// Test script to verify machine detection handler works correctly
const testEvent = {
  call_control_id: "v3:9PAOL9AvcYGwnjLlmSpcj0fRaJqgX1eDfXn2aiFaFuKTWIC6fFYmFQ",
  call_leg_id: "8a07d452-db51-11f0-881a-02420aef981f",
  call_session_id: "8a04eeae-db51-11f0-bb76-02420aef981f",
  client_state: "eyJ2b2ljZUNvbmZpZyI6eyJzY3JpcHQiOiJTdXJlISBIZXJlcyBhIGNvbnZlcnNhdGlvbmFsIGd1aWRlIGZvciBhbiBBSSBhZ2VudCBkZXNpZ25lZCB0byBoYXZlIGFkYXB0aXZlLCBsaXZlIGNvbnZlcnNhdGlvbnMgd2l0aCBwb3RlbnRpYWwgY2FyIGJ1eWVycyBsaWtlIEthaXN5biBCdXJjaC4gLS0tICMjIyBDb252ZXJzYXRpb25hbCBHdWlkZSBmb3IgQUkgU2FsZXMgQWdlbnQgIyMjIyAqKjEuIE9wZW5pbmcgdGhlIENvbnZlcnNhdGlvbioqIC0gKipHcmVldGluZyoqOiAtIEhpIEthaXN5biBCdXJjaCEgSG93cyB5b3VyIGRheSBnb2luZz8gLSAqKkxhbmd1YWdlIFByZWZlcmVuY2UgQ2hlY2sqKjogLSBRdWljayBxdWVzdGlvbmFyZSB5b3UgY29tZm9ydGFibGUgY29udGludWluZyBpbiBFbmdsaXNoLCBvciB3b3VsZCB5b3UgcHJlZmVyIFNwYW5pc2g/ICMjIyMgKioyLiBBZGFwdGl2ZSBEaXNjb3ZlcnkqKiAtICoqSWYgdGhleSByZXNwb25kIHBvc2l0aXZlbHkgYW5kIGVuZ2FnZSoqOiAtIEdyZWF0ISBTbywgSSBzZWUgeW91cmUgaW50ZXJlc3RlZCBpbiBhIG5ldyB2ZWhpY2xlLiBXaGF0cyBnb3QgeW91IHRoaW5raW5nIGFib3V0IGEgbmV3IGNhciByaWdodCBub3c/IC0gKipJZiB0aGV5IHNvdW5kIHJ1c2hlZCBvciBnaXZlIHNob3J0IGFuc3dlcnMqKjogLSBJIHRvdGFsbHkgZ2V0IGl0IGlmIHlvdXJlIGJ1c3khIExldCBtZSBhc2ssIHdoYXQgYXJlIHRoZSB0b3AgZmVhdHVyZXMgeW91cmUgbG9va2luZyBmb3IgaW4gYSBuZXcgdmVoaWNsZT8gLSAqKklmIHRoZXkgZGl2ZSBpbnRvIGRldGFpbHMqKjogLSBUaGF0cyBpbnRlcmVzdGluZyEgQ2FuIHlvdSB0ZWxsIG1lIG1vcmUgYWJvdXQgd2hhdHMgaW1wb3J0YW50IHRvIHlvdSBpbiBhIGNhcj8gSXMgaXQgZnVlbCBlZmZpY2llbmN5LCBzcGFjZSwgb3Igc29tZXRoaW5nIGVsc2U/ICMjIyMgKiozLiBJbnRlbGxpZ2VudCBQcmVzZW50YXRpb24qKiAtICoqQmFzZWQgb24gdGhlaXIgbmVlZHMqKjogLSBJdCBzb3VuZHMgbGlrZSB5b3VyZSByZWFsbHkgbG9va2luZyBmb3Igc29tZXRoaW5nIHRoYXRzIHJlbGlhYmxlIGFuZCBlZmZpY2llbnQuIFdlIGhhdmUgc29tZSBncmVhdCBvcHRpb25zIHRoYXQgZml0IHRoYXQgYmlsbC4gV291bGQgeW91IHByZWZlciBhIHNlZGFuIG9yIGFuIFNVVj8gLSAqKklmIHRoZXkgbWVudGlvbiBidWRnZXQgY29uY2VybnMqKjogLSBJIHVuZGVyc3RhbmQgdGhhdCBidWRnZXQgaXMgYWx3YXlzIGEgY29uc2lkZXJhdGlvbi4gV2UgaGF2ZSB2ZWhpY2xlcyBhdCB2YXJpb3VzIHByaWNlIHBvaW50cywgYW5kIEkgY2FuIGhlbHAgeW91IGZpbmQgc29tZXRoaW5nIHRoYXQgb2ZmZXJzIGdyZWF0IHZhbHVlIHdpdGhvdXQgc3RyZXRjaGluZyB5b3VyIGJ1ZGdldCB0b28gbXVjaC4gIyMjIyAqKjQuIE5hdHVyYWwgT2JqZWN0aW9uIEhhbmRsaW5nKiogLSAqKklmIHRoZXkgZXhwcmVzcyBza2VwdGljaXNtKio6IC0gSSBnZXQgdGhhdCB5b3UgbWlnaHQgaGF2ZSBzb21lIGRvdWJ0cy4gV2hhdHMgb24geW91ciBtaW5kPyBJbSBoZXJlIHRvIGhlbHAgY2xlYXIgdGhpbmdzIHVwLiAtICoqSWYgdGhleSBzZWVtIHRpbWUtc2Vuc2l0aXZlKio6IC0gSSBhcHByZWNpYXRlIHRoYXQgeW91cmUgYnVzeSEgSG93IGFib3V0IEkgc2hhcmUgYSBjb3VwbGUgb2Ygb3B0aW9ucyB0aGF0IG1pZ2h0IHdvcmsgZm9yIHlvdSwgYW5kIHlvdSBjYW4gdGFrZSBhIGxvb2sgYXQgdGhlbSB3aGVuIHlvdSBoYXZlIGEgbW9tZW50PyAtICoqSWYgdGhleSBtZW50aW9uIHByaWNlIGNvbmNlcm5zKio6IC0gSSBjb21wbGV0ZWx5IHVuZGVyc3RhbmQuIExldHMgZXhwbG9yZSBzb21lIGZpbmFuY2luZyBvcHRpb25zIHRoYXQgY2FuIG1ha2UgaXQgbW9yZSBtYW5hZ2VhYmxlIGZvciB5b3UuICMjIyMgKio1LiBBdXRoZW50aWMgQ2xvc2luZyoqIC0gKipSZWFkaW5nIHRoZWlyIHJlYWRpbmVzcyoqOiAtICoqSWYgdGhleSBzZWVtIGV4Y2l0ZWQqKjogVGhhdHMgYXdlc29tZSB0byBoZWFyISBMZXRzIGdldCB5b3Ugc2NoZWR1bGVkIGZvciBhIHRlc3QgZHJpdmUuIFdoYXQgZGF5IHdvcmtzIGJlc3QgZm9yIHlvdT8gLSAqKklmIHRoZXkgc2VlbSBoZXNpdGFudCoqOiAtIEkgZG9udCB3YW50IHRvIHJ1c2ggeW91LiBIb3cgYWJvdXQgSSBzZW5kIHlvdSBzb21lIGRldGFpbHMgb24gdGhlIHZlaGljbGVzIHdlIGRpc2N1c3NlZCwgYW5kIHdlIGNhbiB0b3VjaCBiYXNlIGxhdGVyPyAtICoqTmV4dCBTdGVwcyoqOiAtIEkgY2FuIGZvbGxvdyB1cCB3aXRoIHlvdSB2aWEgZW1haWwgb3IgdGV4dCB3aXRoIG1vcmUgaW5mby4gV2hhdCBkbyB5b3UgcHJlZmVyPyAjIyMjICoqNi4gRW5nYWdpbmcgVGhyb3VnaG91dCB0aGUgQ29udmVyc2F0aW9uKiogLSAqKlVzaW5nIHRoZWlyIG5hbWUqKjogLSBTbywgS2Fpc3luLCB3aGF0cyBiZWVuIHlvdXIgZmF2b3JpdGUgY2FyIHlvdXZlIG93bmVkIHNvIGZhcj8gLSAqKkFjdGl2ZSBsaXN0ZW5pbmcgY3VlcyoqOiAtIFRoYXRzIGEgZ3JlYXQgcG9pbnQhIEkgc2VlIHdoeSB5b3VkIGZlZWwgdGhhdCB3YXkuIC0gSSBoZWFyIHlvdS4gTGV0cyBtYWtlIHN1cmUgd2UgZmluZCBzb21ldGhpbmcgdGhhdCBmaXRzIGFsbCB5b3VyIG5lZWRzLiAjIyMjICoqNy4gQ2xvc2luZyB0aGUgQ29udmVyc2F0aW9uKiogLSAqKldyYXAgdXAgd2l0aCB3YXJtdGgqKjogLSBUaGFua3MgZm9yIGNoYXR0aW5nIHdpdGggbWUgdG9kYXksIEthaXN5biEgSSBlbmpveWVkIGxlYXJuaW5nIGFib3V0IHdoYXQgeW91cmUgbG9va2luZyBmb3IuIElsbCBiZSBoZXJlIHdoZW5ldmVyIHlvdSBuZWVkIGhlbHAgbW92aW5nIGZvcndhcmQhIC0tLSAjIyMgRHluYW1pYyBBZGp1c3RtZW50cyAtICoqRnJpZW5kbHkgYW5kIENoYXR0eSoqOiBNYXRjaCB0aGVpciBlbmVyZ3ksIHNoYXJlIHJlbGF0YWJsZSBzdG9yaWVzIGFib3V0IGNhciBmZWF0dXJlcyBvciBleHBlcmllbmNlcy4gLSAqKlNrZXB0aWNhbCoqOiBCZSBhIGxpdHRsZSBtb3JlIGluZm9ybWF0aXZlIGFuZCBwYXRpZW50LCBwcm92aWRpbmcgZGF0YSBvciB0ZXN0aW1vbmlhbHMgdG8gYnVpbGQgdHJ1c3QuIC0gKipSdXNoZWQqKjogS2VlcCBpdCBxdWljayBhbmQgY29uY2lzZSwgZm9jdXNpbmcgb24gdGhlIGVzc2VudGlhbHMgd2l0aG91dCBmbHVmZi4gLS0tIFRoaXMgZ3VpZGUgZW5zdXJlcyB0aGF0IHRoZSBBSSBhZ2VudCBjYW4gZW5nYWdlIGluIGEgbWVhbmluZ2Z1bCwgYWRhcHRpdmUgY29udmVyc2F0aW9uIHdpdGggcG90ZW50aWFsIGJ1eWVycywgbWFraW5nIHRoZW0gZmVlbCB2YWx1ZWQgYW5kIHVuZGVyc3Rvb2QgdGhyb3VnaG91dCB0aGUgcHJvY2Vzcy4iLCJ2b2ljZSI6eyJpZCI6InNhcmFoIiwibmFtZSI6IlNhcmFoIiwiZWxldmVuTGFic0lkIjoiRVhBVklUUXU0dnI0eG5TRHhNYUwiLCJnZW5kZXIiOiJmZW1hbGUiLCJsYW5ndWFnZSI6ImVuIn0sInBlcnNvbmFsaXR5TW9kZSI6ImFkYXB0aXZlIiwibXVsdGlsaW5ndWFsRW5hYmxlZCI6dHJ1ZSwic3VwcG9ydGVkTGFuZ3VhZ2VzIjpbImVuIiwiZXMiXX0sImxlYWREYXRhIjp7Im5hbWUiOiJLYWlzeW4gQnVyY2giLCJzdGFnZSI6Im5ldyJ9LCJsZWFkUGhvbmUiOiIrMTkwMzcwNzQyODEiLCJ0aW1lc3RhbXAiOiIyMDI1LTEyLTE3VDE0OjA2OjA5Ljk5N1oifQ==",
  connection_id: "2826445349592237336",
  from: "+19034830081",
  result: "human",
  to: "+19037074281"
};

// Function to simulate machine detection handler
function simulateMachineDetection() {
  try {
    const result = testEvent.result;
    console.log('🤖 [TEST] Machine detection result:', result);
    
    if (result === 'human' || result === undefined || result === 'unknown') {
      console.log('🗣️ [TEST] Human detected - generating AI commands');
      
      // Extract voice configuration from client_state
      let voiceConfig = {};
      let language = 'en-US';
      let leadData = {};
      
      try {
        if (testEvent.client_state) {
          const clientState = JSON.parse(Buffer.from(testEvent.client_state, 'base64').toString());
          console.log('📋 [TEST] Parsed client state:', JSON.stringify(clientState, null, 2));
          
          if (clientState.voiceConfig && clientState.voiceConfig.voice) {
            voiceConfig = {
              voice: clientState.voiceConfig.voice.elevenLabsId || 'female'
            };
            language = clientState.voiceConfig.voice.language || 'en-US';
          }
          
          if (clientState.leadData) {
            leadData = clientState.leadData;
          }
        }
      } catch (parseError) {
        console.log('⚠️ [TEST] Could not parse client_state, using defaults:', parseError);
      }
      
      // Generate personalized greeting
      let greeting = "Hello! Thank you for answering. I'm Sarah calling about your interest in our services. Can you hear me okay? Please say yes or press 1 if you can hear me.";
      if (leadData.name) {
        greeting = `Hi ${leadData.name}! Thank you for answering. I'm Sarah calling about your interest in our services. Can you hear me okay? Please say yes or press 1 if you can hear me.`;
      }
      
      const aiCommands = {
        success: true,
        commands: [
          {
            command: 'speak',
            text: greeting,
            voice: voiceConfig.voice || 'female',
            service_level: "basic"
          },
          {
            command: 'gather_using_speech',
            speech_timeout: 8000,
            speech_end_timeout: 1500,
            language: language,
            webhook_url: 'https://ghostcrm.ai/api/voice/telnyx/ai-response',
            inter_digit_timeout: 5000,
            valid_digits: "1234567890*#"
          }
        ]
      };
      
      console.log('🎮 [TEST] Generated AI commands:', JSON.stringify(aiCommands, null, 2));
      return aiCommands;
    } else {
      console.log('🤖 [TEST] Machine detected, hanging up');
      return {
        success: true,
        commands: [
          {
            command: 'hangup'
          }
        ]
      };
    }
  } catch (error) {
    console.error('❌ [TEST] Error in machine detection:', error);
    return {
      success: true,
      commands: [
        {
          command: 'speak',
          text: "Hello! Thank you for answering. I'm Sarah, an AI assistant. Can you hear me okay?",
          voice: 'female',
          service_level: "basic"
        }
      ]
    };
  }
}

// Run the test
console.log('🧪 Starting machine detection test...');
const result = simulateMachineDetection();
console.log('✅ Test complete!');
console.log('📤 Final response that would be sent to Telnyx:', JSON.stringify(result, null, 2));