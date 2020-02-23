#include <iostream>
#include <cmath>
using namespace std;

struct vec3 {
	float x;
	float y;
	float z;
};

const float PI = 3.14159265359;
float RadianToAngle(float radian);
float DotProduct(vec3 v1, vec3 v2);
float FindAngle(vec3 v1, vec3 v2);
vec3 CrossProduct(vec3 v1, vec3 v2);



int main() {
	//Test 1
	vec3 v1 = { 2,2,-1 };
	vec3 v2 = { 5,-3,2 };
	vec3 v3 = CrossProduct(v1, v2);
	cout << "Vector 1 = ( 2, 2, -1 ) Vector2 = ( 5, -3, 2)" << endl;
	cout << "Dot Product: " << DotProduct(v1, v2) << endl;
	cout << "FindAngle: " << FindAngle(v1, v2) << endl;
	cout << "CrossProduct (v1 x v2): " << v3.x << " " << v3.y << " " << v3.z << endl << endl;
	
	// Test 2
	vec3 v4 = { 1, 3, 4 };
	vec3 v5 = { 2, 7, -5 };
	vec3 v6 = CrossProduct(v4, v5);
	cout << "Vector 1 = ( 1, 3, 4 ) Vector2 = ( 2, 7, -5)" << endl;
	cout << "Dot Product: " << DotProduct(v4, v5) << endl;
	cout << "FindAngle: " << FindAngle(v4, v5) << endl;
	cout << "CrossProduct (v1 x v2): " << v6.x << " " << v6.y << " " << v6.z << endl;

	return 0;
}

// Returns the equivalent angle of the given radian
float RadianToAngle(float radian)
{
	return radian * (180.0/PI);
}

// Returns the dot product of two vectors
float DotProduct(vec3 v1, vec3 v2)
{
	float dot_product = (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
	return dot_product;
}

// Returns the angle between the two vector 
float FindAngle(vec3 v1, vec3 v2)
{
	float dot_product = DotProduct(v1, v2);
	float v1_length = sqrtf((v1.x * v1.x) + (v1.y * v1.y) + (v1.z * v1.z));
	float v2_length = sqrtf((v2.x * v2.x) + (v2.y * v2.y) + (v2.z * v2.z));
	float radian = acos(dot_product / (v1_length * v2_length));
	return RadianToAngle(radian);
}

// Returns the cross product of two vectors
vec3 CrossProduct(vec3 v1, vec3 v2)
{
	vec3 v3;
	v3.x = (v1.y * v2.z) - (v1.z * v2.y);
	v3.y = (v1.x * v2.z) - (v1.z * v2.x);
	v3.z = (v1.x * v2.y) - (v1.y * v2.x);
	return v3;
}
