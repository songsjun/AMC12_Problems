# 2012 AMC 12B Problem 16

> This problem is the same as [2012 AMC 12B #16](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12B_Problems) and [2012 AMC 10B #24](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10B_Problems).
## Problem
Amy, Beth, and Jo listen to four different songs and discuss which ones they like. No song is liked by all three. Furthermore, for each of the three pairs of the girls, there is at least one song liked by those two girls but disliked by the third. In how many different ways is this possible?

$\textbf{(A)}\ 108\qquad\textbf{(B)}\ 132\qquad\textbf{(C)}\ 671\qquad\textbf{(D)}\ 846\qquad\textbf{(E)}\ 1105$
## Solutions
### Solution 1
Let the ordered triple (a,b,c) denote that a songs are liked by Amy and Beth, b songs by Beth and Jo, and c songs by Jo and Amy. The only possible triples are (1,1,1), (2,1,1), (1,2,1)(1,1,2).

To show this, first observe these are all valid conditions. Second, note that none of a,b,c can be bigger than 3. Suppose otherwise, that $a = 3$. Without loss of generality, say that Amy and Beth like songs 1, 2, and 3. Then because there is at least one song liked by each pair of girls, we require either b or c to be at least 1. In fact, we require either b or c to equal 1, otherwise there will be a song liked by all three. Suppose $b = 1$. Then we must have $c=0$ since no song is liked by all three girls, which contradicts with the statement "for each of the three pairs of the girls, there is at least one song liked by those two girls".

**Case 1**: How many ways are there for (a,b,c) to equal (1,1,1)? There are 4 choices for which song is liked by Amy and Beth, 3 choices for which song is liked by Beth and Jo, and 2 choices for which song is liked by Jo and Amy. The fourth song can be liked by only one of the girls, or none of the girls, for a total of 4 choices. So (a,b,c)=(1,1,1) in $4\cdot3\cdot2\cdot4 = 96$ ways.

**Case 2**: To find the number of ways for (a,b,c) = (2,1,1) (without order), observe there are $\binom{4}{2} = 6$ choices of songs for the first pair of girls. There remain 2 choices of songs for the next pair (who only like one song). The last song is given to the last pair of girls. But observe that we can let any three pairs of the girls to like two songs, so we multiply by 3. In this case there are ($6\cdot2)\cdot3=36$ ways for the girls to like the songs.

That gives a total of $96 + 36 = 132$ ways for the girls to like the songs, so the answer is $\boxed{(\textrm{\textbf{B}})}.$
### Solution 2
Let AB, BJ, and AJ denote a song that is liked by Amy and Beth (but not Jo), Beth and Jo (but not Amy), and Amy and Jo (but not Beth), respectively. Similarly, let A, B, J, and N denote a song that is liked by only Amy, only Beth, only Jo, and none of them, respectively. Since we know that there is at least 1\: AB, BJ, and AJ, they must be 3 songs out of the 4 that Amy, Beth, and Jo listened to. The fourth song can be of any type N, A, B, J, AB, BJ, and AJ (there is no ABJ because no song is liked by all three, as stated in the problem.) Therefore, we must find the number of ways to rearrange AB, BJ, AJ, and a song from the set $\{N, A, B, J, AB, BJ, AJ\}$.

Case 1: Fourth song = N, A, B, J

Note that in Case 1, all four of the choices for the fourth song are different from the first three songs.

Number of ways to rearrange = (4!) rearrangements for each choice *\: 4 choices = 96.

Case 2: Fourth song = AB, BJ, AJ

Note that in Case 2, all three of the choices for the fourth song repeat somewhere in the first three songs.

Number of ways to rearrange = (4!/2!) rearrangements for each choice *\: 3 choices = 36.

$$96 + 36 = \boxed{\textbf{(B)} \: 132}.$$
### Solution 3
There are $\binom{4}{3}$ ways to choose the three songs that are liked by the three pairs of girls.

There are 3! ways to determine how the three songs are liked, or which song is liked by which pair of girls.

In total, there are $\binom{4}{3}\cdot3$! possibilities for the first 3 songs.

There are 3 cases for the 4th song, call it song D.

Case 1: D is disliked by all 3 girls $\implies$ there is only 1 possibility.

Case 2: D is liked by exactly 1 girl $\implies$ there are 3 possibility.

Case 3: D is liked by exactly 2 girls $\implies$ there are 3 pairs of girls to choose from. However, there's overlap when the other song liked by the same pair of girl is counted as the 4th song at some point, in which case D would be counted as one of the first 3 songs liked by the same girls.

Counting the overlaps, there are 3 ways to choose the pair with overlaps and $4\cdot3=12$ ways to choose what the other 2 pairs like independently. In total, there are $3\cdot12=36$ overlapped possibilities.

Finally, there are $\binom{4}{3}\cdot3$!$\cdot(3+1+3)-36=132$ ways for the songs to be likely by the girls. $\boxed{\mathrm{(B)}}$

*~Nafer*
### Solution 4
This is a bipartite graph problem, with the girls as left vertices and songs as right vertices. An edge connecting left vertex and right vertex means that a girl likes a song.

Condition 1: "No song is liked by all three", means that the degree of right vertices is at most 2.

Condition 2: "for each of the three pairs of the girls, there is at least one song liked by those two girls but disliked by the third", means that for any pair of left vertices, there is at least a right vertex connecting to them.

To meet condition 2, there are at least 3 right vertices with 2 edges connecting to left vertices.  There are 2 cases:

Case 1: there are only 3 such right vertices. There are $\binom{4}{3}$ such vertices, with 3! ways of connections to the left vertices, total arrangements are $\binom{4}{3}\cdot3$! = 24. The fourth right vertex either has no edge to the 3 left vertices, or 1 edge to 1 of the 3 left vertices.  So there are $24\cdot(1+3) = 96$ ways.

Case 2: there are 4 such right vertices, 2 of them have edges to the same pair of left vertices.  There are $\binom{4}{2}$ such vertices, with 3! ways of connections.  So there are $\binom{4}{2}\cdot3$! = 36 ways.

Total ways are $96+36=132$.

Another way is to overcount then subtract overlap ways.  Similar to previous case 1,  the fourth right vertex could have all possible connection to the left vertices except connecting to all 3, so it is $2^3-1=7$ ways, so the total ways are $\binom{4}{3}\cdot3$!$\cdot7 = 24\cdot7 = 168.$  But this overcounts the case 2 with 36 ways.  So total ways are $168-36=132$.

-[https://artofproblemsolving.com/wiki/index.php/User:Junche junche]
### Solution 5
Let's assign to each of the 3 pairs a song that they like, and that song is disliked by the other girl(satisfy the problem's 2nd condition). The first pair has 4 choice, 2nd has 3 choice, and last one has 2 choice. 4 $\cdot 3 \cdot 2.$ Then the last song can be liked/disliked freely, so there is $2^3 = 8$ total ways they can like/dislike the songs. Of these 8 cases, one of them is when they all like the song (which isn't allowed by the problem), so we subtract it away to have 7 cases. 4 $\cdot 3 \cdot 2 \cdot 7 = 168.$ But, we have overcounts when one pair of girls likes 2 songs, and the other girl dislikes those 2 songs. We can find the amount of cases that this happens by giving 1 pair of girls 2 songs that they like (and the other dislikes), and the other 2 pairs of girls 1 song that they like. There are 3 pairs of girls that we can choose to like 2 songs, so there are 3 $\cdot \left(\binom$ {4}{2} $\cdot 2 \cdot 1\right) = 36$ ways. 168 - 36 = $\boxed$ {$\textbf{(B) 132}$}.

*~heheman*
*~Arcticturn (minor fixes in LaTeX)*
*~EthanSpoon (minor fixes in LaTeX)*
## Video Solution by Pi Academy
https://youtu.be/yZmJ-TEfiWI?si=fp2Jk-Y2VjtHr9RE ~ Pi Academy
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2012amc10b/272

*~dolphin7*
## See Also
