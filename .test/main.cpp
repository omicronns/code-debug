#include <iostream>
#include <thread>
#include <chrono>

using namespace std::literals::chrono_literals;
using std::this_thread::sleep_for;
using std::cout;
using std::endl;

int main() {
	auto val = 0;
	while (true) {
		sleep_for(1s);
		cout << "val: " << val++ << endl;
	}
	return 0;
}
