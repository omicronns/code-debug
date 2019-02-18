#include <iostream>
#include <thread>
#include <chrono>
#include <vector>

using namespace std::literals::chrono_literals;
using std::this_thread::sleep_for;
using std::cout;
using std::endl;
using std::vector;

int main() {
	auto val = 0;
	auto vec = vector<int>{ 1, 2, 3 };
	while (true) {
		sleep_for(1s);
		cout << "val: " << val++ << endl;
		cout << "vec: " << vec[0]++ << endl;
	}
	return 0;
}
