export interface KotlinSourceFile {
  filename: string;
  path: string;
  category: 'manifest' | 'gradle' | 'toml' | 'model' | 'db' | 'viewmodel' | 'ui' | 'theme' | 'di' | 'pref' | 'repo' | 'work' | 'test' | 'doc';
  code: string;
  description: string;
}

export const ANDROID_KOTLIN_CODEBASE: KotlinSourceFile[] = [
  // 1. Screen.kt (Only 3 Primary Screens + Sub-routes)
  {
    filename: 'Screen.kt',
    path: 'app/src/main/java/com/example/nofapcounter/ui/navigation/Screen.kt',
    category: 'ui',
    description: 'Minimal Navigation routes (Home, Stats, Settings, About, HabitEdit)',
    code: `package com.example.nofapcounter.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "NoFap Counter")
    object Stats : Screen("stats", "Streak Stats")
    object Settings : Screen("settings", "Settings")
    object About : Screen("about", "About")

    object HabitEdit : Screen("habit_edit?habitId={habitId}", "Edit Habit") {
        fun createRoute(habitId: Int? = null) = if (habitId != null) "habit_edit?habitId=\$habitId" else "habit_edit"
    }
}`
  },

  // 2. AppNavigation.kt (Screen Transitions: 300ms Slide-In + Fade)
  {
    filename: 'AppNavigation.kt',
    path: 'app/src/main/java/com/example/nofapcounter/ui/navigation/AppNavigation.kt',
    category: 'ui',
    description: 'Minimal NavHost navigation with smooth 300ms slide-in + fade screen transitions',
    code: `package com.example.nofapcounter.ui.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.example.nofapcounter.data.preferences.UserPreferencesRepository
import com.example.nofapcounter.domain.repository.HabitRepository
import com.example.nofapcounter.ui.screens.*
import com.example.nofapcounter.ui.viewmodel.DayCounterViewModel
import com.example.nofapcounter.work.ReminderScheduler

@Composable
fun AppNavigation(
    viewModel: DayCounterViewModel,
    preferencesRepository: UserPreferencesRepository,
    habitRepository: HabitRepository,
    reminderScheduler: ReminderScheduler,
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        enterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Start, animationSpec = tween(300)) + fadeIn(animationSpec = tween(300)) },
        exitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Start, animationSpec = tween(300)) + fadeOut(animationSpec = tween(300)) },
        popEnterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.End, animationSpec = tween(300)) + fadeIn(animationSpec = tween(300)) },
        popExitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.End, animationSpec = tween(300)) + fadeOut(animationSpec = tween(300)) },
        modifier = modifier.fillMaxSize()
    ) {
        // 1. Home Screen
        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = viewModel,
                onNavigateToStats = { navController.navigate(Screen.Stats.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) },
                onNavigateToAbout = { navController.navigate(Screen.About.route) },
                onNavigateToEdit = { habitId ->
                    navController.navigate(Screen.HabitEdit.createRoute(habitId))
                },
                onNavigateToAdd = {
                    navController.navigate(Screen.HabitEdit.createRoute())
                }
            )
        }

        // 2. Stats Screen
        composable(Screen.Stats.route) {
            StatsScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 3. Settings Screen
        composable(Screen.Settings.route) {
            SettingsScreen(
                viewModel = viewModel,
                preferencesRepository = preferencesRepository,
                habitRepository = habitRepository,
                reminderScheduler = reminderScheduler,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 4. About Screen
        composable(Screen.About.route) {
            AboutScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 5. Habit Edit Screen
        composable(
            route = Screen.HabitEdit.route,
            arguments = listOf(
                navArgument("habitId") {
                    type = NavType.IntType
                    defaultValue = -1
                }
            )
        ) { backStackEntry ->
            val habitId = backStackEntry.arguments?.getInt("habitId")?.takeIf { it != -1 }
            HabitEditScreen(
                habitId = habitId,
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}`
  },

  // 3. HomeScreen.kt (TopBar with 3-dot overflow menu + Modern Cards + Staggered and Pulse Animations)
  {
    filename: 'HomeScreen.kt',
    path: 'app/src/main/java/com/example/nofapcounter/ui/screens/HomeScreen.kt',
    category: 'ui',
    description: 'HomeScreen with staggered card entry, animateItemPlacement, FAB scroll shrink, and day count pulse transitions',
    code: `package com.example.nofapcounter.ui.screens

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nofapcounter.data.local.entity.Habit
import com.example.nofapcounter.ui.viewmodel.DayCounterViewModel
import kotlinx.coroutines.delay

private val AccentTeal = Color(0xFF00897B)

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun HomeScreen(
    viewModel: DayCounterViewModel,
    onNavigateToStats: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToAbout: () -> Unit,
    onNavigateToEdit: (habitId: Int) -> Unit,
    onNavigateToAdd: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var habitToReset by remember { mutableStateOf<Habit?>(null) }
    var habitToDelete by remember { mutableStateOf<Habit?>(null) }
    var showOverflowMenu by remember { mutableStateOf(false) }

    val listState = rememberLazyListState()
    val context = LocalContext.current

    // FAB scroll effect: shrink to 0.9x on scroll down, return to 1.0x on scroll up
    val isScrollingDown by remember {
        derivedStateOf {
            listState.firstVisibleItemScrollOffset > 0 && listState.isScrollInProgress
        }
    }
    val fabScale by animateFloatAsState(
        targetValue = if (isScrollingDown) 0.9f else 1.0f,
        animationSpec = tween(durationMillis = 200),
        label = "fabScale"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("NoFap Counter", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                    actionIconContentColor = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                actions = {
                    IconButton(onClick = { showOverflowMenu = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Menu")
                    }
                    DropdownMenu(
                        expanded = showOverflowMenu,
                        onDismissRequest = { showOverflowMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Stats") },
                            onClick = {
                                showOverflowMenu = false
                                onNavigateToStats()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Settings") },
                            onClick = {
                                showOverflowMenu = false
                                onNavigateToSettings()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("About") },
                            onClick = {
                                showOverflowMenu = false
                                onNavigateToAbout()
                            }
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToAdd,
                shape = CircleShape,
                containerColor = AccentTeal,
                contentColor = Color.White,
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                modifier = Modifier.scale(fabScale)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Habit")
            }
        }
    ) { paddingValues ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF5F5F5))
        ) {
            if (uiState.habits.isEmpty() && !uiState.isLoading) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("No habits yet", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Tap below to start your day counter.", color = Color.Gray)
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = onNavigateToAdd,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentTeal),
                        modifier = Modifier.fillMaxWidth(0.7f).height(50.dp)
                    ) {
                        Text("Add Habit", fontWeight = FontWeight.Bold)
                    }
                }
            } else {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 88.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    itemsIndexed(uiState.habits, key = { _, habit -> habit.id }) { index, habit ->
                        val liveDays = habit.calculateLiveStreakDays()

                        // Staggered animated visibility for initial entrance
                        var visible by remember { mutableStateOf(false) }
                        LaunchedEffect(Unit) {
                            delay(index * 50L)
                            visible = true
                        }

                        AnimatedVisibility(
                            visible = visible,
                            enter = fadeIn(animationSpec = tween(250)) + slideInVertically(
                                initialOffsetY = { 30 },
                                animationSpec = tween(250)
                            ),
                            exit = fadeOut(animationSpec = tween(200)) + scaleOut(targetScale = 0.85f, animationSpec = tween(200)),
                            modifier = Modifier.animateItemPlacement(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
                        ) {
                            ElevatedCard(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.elevatedCardColors(containerColor = Color.White),
                                elevation = CardDefaults.elevatedCardElevation(defaultElevation = 4.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .combinedClickable(
                                        onClick = { onNavigateToEdit(habit.id) },
                                        onLongClick = { habitToDelete = habit }
                                    )
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = habit.name,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF1E293B),
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Best: \${maxOf(habit.bestStreak, liveDays)} \${if (maxOf(habit.bestStreak, liveDays) == 1) "day" else "days"}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color(0xFF64748B)
                                        )
                                    }

                                    // Day Count Number with animated content transition and scale pulse
                                    Column(
                                        horizontalAlignment = Alignment.End,
                                        modifier = Modifier.padding(horizontal = 12.dp)
                                    ) {
                                        AnimatedContent(
                                            targetState = liveDays,
                                            transitionSpec = {
                                                (slideInVertically { height -> height } + fadeIn()) with
                                                (slideOutVertically { height -> -height } + fadeOut())
                                            },
                                            label = "dayCount"
                                        ) { targetCount ->
                                            Text(
                                                text = "$targetCount",
                                                fontSize = 32.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color(0xFF0F172A),
                                                lineHeight = 32.sp
                                            )
                                        }
                                        Text(
                                            text = if (liveDays == 1) "DAY" else "DAYS",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF94A3B8)
                                        )
                                    }

                                    // Reset Icon Button with 0.95x scale-down on press & teal ripple
                                    val interactionSource = remember { MutableInteractionSource() }
                                    val isPressed by interactionSource.collectIsPressedAsState()
                                    val buttonScale by animateFloatAsState(
                                        targetValue = if (isPressed) 0.95f else 1.0f,
                                        animationSpec = tween(durationMillis = 100),
                                        label = "buttonScale"
                                    )

                                    IconButton(
                                        onClick = { habitToReset = habit },
                                        interactionSource = interactionSource,
                                        modifier = Modifier
                                            .size(40.dp)
                                            .scale(buttonScale)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Refresh,
                                            contentDescription = "Reset streak",
                                            tint = Color(0xFF94A3B8)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Reset Confirmation Dialog with Haptic Feedback
    habitToReset?.let { habit ->
        AlertDialog(
            onDismissRequest = { habitToReset = null },
            shape = RoundedCornerShape(16.dp),
            containerColor = Color.White,
            title = { Text("Reset '\${habit.name}'?", fontWeight = FontWeight.Bold, color = Color(0xFF1E293B)) },
            text = { Text("This will reset your current streak to 0 days.", color = Color(0xFF475569)) },
            confirmButton = {
                Button(
                    onClick = {
                        val vibrator = context.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? Vibrator
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            vibrator?.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
                        } else {
                            @Suppress("DEPRECATION")
                            vibrator?.vibrate(50)
                        }
                        viewModel.logRelapse(habit.id, "Reset")
                        habitToReset = null
                    },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                ) { Text("Confirm Reset", fontWeight = FontWeight.Bold) }
            },
            dismissButton = {
                TextButton(onClick = { habitToReset = null }) { Text("Cancel", color = Color(0xFF64748B)) }
            }
        )
    }

    // Delete Dialog
    habitToDelete?.let { habit ->
        AlertDialog(
            onDismissRequest = { habitToDelete = null },
            shape = RoundedCornerShape(16.dp),
            containerColor = Color.White,
            title = { Text("Delete '\${habit.name}'?", fontWeight = FontWeight.Bold, color = Color(0xFF1E293B)) },
            text = { Text("Permanently remove this habit counter and all its history?", color = Color(0xFF475569)) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteHabitById(habit.id)
                        habitToDelete = null
                    },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                ) { Text("Delete", fontWeight = FontWeight.Bold) }
            },
            dismissButton = {
                TextButton(onClick = { habitToDelete = null }) { Text("Cancel", color = Color(0xFF64748B)) }
            }
        )
    }
}`
  },

  // 4. StatsScreen.kt (Modern Light Cards - Current, Best, Total days + Relapse History)
  {
    filename: 'StatsScreen.kt',
    path: 'app/src/main/java/com/example/nofapcounter/ui/screens/StatsScreen.kt',
    category: 'ui',
    description: 'Modern Light Theme StatsScreen showing Current, Best, and Total days with relapse history card',
    code: `package com.example.nofapcounter.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nofapcounter.ui.viewmodel.DayCounterViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(
    viewModel: DayCounterViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val habit = uiState.selectedHabit
    val currentStreak = habit?.calculateLiveStreakDays() ?: 0
    val bestStreak = habit?.let { maxOf(it.bestStreak, currentStreak) } ?: 0
    val totalDays = habit?.let {
        val daysSinceCreated = maxOf(1, ((System.currentTimeMillis() - it.createdAt) / (1000 * 60 * 60 * 24)).toInt())
        maxOf(currentStreak, daysSinceCreated)
    } ?: 0

    val relapseLogs = uiState.relapseLogs.sortedByDescending { it.timestamp }
    val dateFormat = remember { SimpleDateFormat("MMM d, yyyy • h:mm a", Locale.getDefault()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Stats", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF1E293B))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF5F5F5)),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Large Numbers Row in Modern Elevated Card
            item {
                ElevatedCard(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.elevatedCardColors(containerColor = Color.White),
                    elevation = CardDefaults.elevatedCardElevation(defaultElevation = 4.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 20.dp, horizontal = 12.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "$currentStreak",
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF0D9488)
                            )
                            Text(
                                text = "Current",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B)
                            )
                            Text("streak", style = MaterialTheme.typography.labelSmall, color = Color(0xFF94A3B8))
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "$bestStreak",
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF2563EB)
                            )
                            Text(
                                text = "Best",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B)
                            )
                            Text("streak", style = MaterialTheme.typography.labelSmall, color = Color(0xFF94A3B8))
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "$totalDays",
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFFD97706)
                            )
                            Text(
                                text = "Total",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B)
                            )
                            Text("days", style = MaterialTheme.typography.labelSmall, color = Color(0xFF94A3B8))
                        }
                    }
                }
            }

            // 2. Relapse History Section Card
            item {
                ElevatedCard(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.elevatedCardColors(containerColor = Color.White),
                    elevation = CardDefaults.elevatedCardElevation(defaultElevation = 4.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "RELAPSE HISTORY",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B)
                            )
                            Text(
                                text = "\${relapseLogs.size} records",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF94A3B8)
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        HorizontalDivider(color = Color(0xFFF1F5F9))

                        if (relapseLogs.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No relapses logged",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                        } else {
                            relapseLogs.forEach { log ->
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 12.dp)
                                ) {
                                    Text(
                                        text = dateFormat.format(Date(log.timestamp)),
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color(0xFF1E293B)
                                    )
                                    if (!log.note.isNullOrBlank() && log.note != "Reset") {
                                        Text(
                                            text = log.note,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color(0xFF64748B)
                                        )
                                    }
                                }
                                HorizontalDivider(color = Color(0xFFF1F5F9))
                            }
                        }
                    }
                }
            }
        }
    }
}`
  },

  // 5. AboutScreen.kt (With Back Arrow)
  {
    filename: 'AboutScreen.kt',
    path: 'app/src/main/java/com/example/nofapcounter/ui/screens/AboutScreen.kt',
    category: 'ui',
    description: 'AboutScreen with Back navigation in TopAppBar',
    code: `package com.example.nofapcounter.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AboutScreen(
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("About", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("NoFap Counter", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Version 1.0.0 • 100% Offline • Local Room Storage")
        }
    }
}`
  },

  // 6. SettingsScreen.kt (Minimal: Dark mode, Daily reminder, Reminder time, Reset all data)
  {
    filename: 'SettingsScreen.kt',
    path: 'app/src/main/java/com/example/nofapcounter/ui/screens/SettingsScreen.kt',
    category: 'ui',
    description: 'Minimal SettingsScreen with Dark mode, Daily reminder, Reminder time picker, and Reset all data',
    code: `package com.example.nofapcounter.ui.screens

import android.app.TimePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.nofapcounter.data.preferences.UserPreferencesRepository
import com.example.nofapcounter.domain.repository.HabitRepository
import com.example.nofapcounter.ui.viewmodel.DayCounterViewModel
import com.example.nofapcounter.work.ReminderScheduler
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: DayCounterViewModel,
    preferencesRepository: UserPreferencesRepository,
    habitRepository: HabitRepository,
    reminderScheduler: ReminderScheduler,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    val isDarkMode by preferencesRepository.isDarkMode.collectAsState(initial = true)
    val reminderEnabled by preferencesRepository.reminderEnabled.collectAsState(initial = false)
    val reminderTime by preferencesRepository.reminderTime.collectAsState(initial = "20:00")

    var showResetDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
        ) {
            // 1. Dark mode (Switch)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .defaultMinSize(minHeight = 56.dp)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Dark mode",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
                Switch(
                    checked = isDarkMode,
                    onCheckedChange = { checked ->
                        coroutineScope.launch { preferencesRepository.setDarkMode(checked) }
                    }
                )
            }
            HorizontalDivider()

            // 2. Daily reminder (Switch)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .defaultMinSize(minHeight = 56.dp)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Daily reminder",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
                Switch(
                    checked = reminderEnabled,
                    onCheckedChange = { checked ->
                        coroutineScope.launch {
                            preferencesRepository.setReminderEnabled(checked)
                            if (checked) {
                                val parts = reminderTime.split(":")
                                val hour = parts.getOrNull(0)?.toIntOrNull() ?: 20
                                val minute = parts.getOrNull(1)?.toIntOrNull() ?: 0
                                reminderScheduler.scheduleDailyReminder(hour, minute)
                            } else {
                                reminderScheduler.cancelReminder()
                            }
                        }
                    }
                )
            }
            HorizontalDivider()

            // 3. Reminder time (button, opens time picker — shown only when reminder is ON)
            if (reminderEnabled) {
                val parts = reminderTime.split(":")
                val hour = parts.getOrNull(0)?.toIntOrNull() ?: 20
                val minute = parts.getOrNull(1)?.toIntOrNull() ?: 0

                val formattedTime = remember(reminderTime) {
                    val period = if (hour >= 12) "PM" else "AM"
                    val displayHour = if (hour % 12 == 0) 12 else hour % 12
                    String.format(Locale.getDefault(), "%d:%02d %s", displayHour, minute, period)
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .defaultMinSize(minHeight = 56.dp)
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Reminder time",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium
                    )
                    OutlinedButton(
                        onClick = {
                            TimePickerDialog(
                                context,
                                { _, selectedHour, selectedMinute ->
                                    val newTimeStr = String.format(Locale.getDefault(), "%02d:%02d", selectedHour, selectedMinute)
                                    coroutineScope.launch {
                                        preferencesRepository.setReminderTime(newTimeStr)
                                        reminderScheduler.scheduleDailyReminder(selectedHour, selectedMinute)
                                    }
                                },
                                hour,
                                minute,
                                false
                            ).show()
                        }
                    ) {
                        Text(formattedTime, fontWeight = FontWeight.SemiBold)
                    }
                }
                HorizontalDivider()
            }

            // 4. Reset all data (red text button, confirmation dialog)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .defaultMinSize(minHeight = 56.dp)
                    .clickable { showResetDialog = true }
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                Text(
                    text = "Reset all data",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }

    // Reset All Data Confirmation Dialog
    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("Reset all data?", fontWeight = FontWeight.Bold) },
            text = { Text("This will permanently delete all habits, streak counters, and relapse history. This action cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            habitRepository.deleteAllHabits()
                            showResetDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Reset")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showResetDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}`
  },

  // 7. HabitEditScreen.kt (Minimal: Name, Start Date, 6 Colors, 6 Emojis, Save, Delete)
  {
    filename: 'HabitEditScreen.kt',
    path: 'app/src/main/java/com/example/nofapcounter/ui/screens/HabitEditScreen.kt',
    category: 'ui',
    description: 'Minimal HabitEditScreen with Name, Start Date, 6 colors, 6 emojis, Save and Delete buttons',
    code: `package com.example.nofapcounter.ui.screens

import android.app.DatePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nofapcounter.data.local.entity.Habit
import com.example.nofapcounter.ui.viewmodel.DayCounterViewModel
import java.text.SimpleDateFormat
import java.util.*

private val SIX_COLORS = listOf(
    Color(0xFF2563EB), // Blue
    Color(0xFF06B6D4), // Cyan
    Color(0xFF10B981), // Emerald
    Color(0xFF8B5CF6), // Purple
    Color(0xFFF59E0B), // Amber
    Color(0xFFEF4444)  // Red
)

private val SIX_EMOJIS = listOf("🛡️", "🚿", "🧘", "📵", "🏋️", "⚡")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HabitEditScreen(
    habitId: Int?,
    viewModel: DayCounterViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val existingHabit = remember(habitId, uiState.habits) {
        if (habitId != null) uiState.habits.find { it.id == habitId } else null
    }
    val isEditing = existingHabit != null

    var name by remember { mutableStateOf(existingHabit?.name ?: "") }
    var startDateMillis by remember { mutableStateOf(existingHabit?.startDate ?: System.currentTimeMillis()) }
    var selectedColor by remember { mutableStateOf(existingHabit?.let { Color(it.color) } ?: SIX_COLORS[0]) }
    var selectedEmoji by remember { mutableStateOf(existingHabit?.icon ?: SIX_EMOJIS[0]) }
    var nameError by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val calendar = remember { Calendar.getInstance() }
    val dateFormat = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isEditing) "Edit Habit" else "New Habit", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // 1. Name Field
                OutlinedTextField(
                    value = name,
                    onValueChange = {
                        name = it
                        if (it.isNotBlank()) nameError = false
                    },
                    label = { Text("Name") },
                    isError = nameError,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // 2. Start Date Button
                Column {
                    Text("START DATE", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedButton(
                        onClick = {
                            calendar.timeInMillis = startDateMillis
                            DatePickerDialog(
                                context,
                                { _, y, m, d ->
                                    val sel = Calendar.getInstance().apply { set(y, m, d, 0, 0, 0) }
                                    startDateMillis = sel.timeInMillis
                                },
                                calendar.get(Calendar.YEAR),
                                calendar.get(Calendar.MONTH),
                                calendar.get(Calendar.DAY_OF_MONTH)
                            ).show()
                        },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(dateFormat.format(Date(startDateMillis)), fontWeight = FontWeight.SemiBold)
                    }
                }

                // 3. Color Circles
                Column {
                    Text("COLOR", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        SIX_COLORS.forEach { color ->
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .background(color, CircleShape)
                                    .clickable { selectedColor = color }
                                    .then(
                                        if (selectedColor == color) {
                                            Modifier.border(3.dp, MaterialTheme.colorScheme.onBackground, CircleShape)
                                        } else Modifier
                                    )
                            )
                        }
                    }
                }

                // 4. Emoji Icons
                Column {
                    Text("ICON", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        SIX_EMOJIS.forEach { emoji ->
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .background(
                                        if (selectedEmoji == emoji) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .border(
                                        width = if (selectedEmoji == emoji) 2.dp else 1.dp,
                                        color = if (selectedEmoji == emoji) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .clickable { selectedEmoji = emoji },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(emoji, fontSize = 20.sp)
                            }
                        }
                    }
                }
            }

            // 5. Bottom Action Buttons (Save full-width, Delete full-width)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = {
                        if (name.isBlank()) {
                            nameError = true
                            return@Button
                        }
                        if (isEditing && existingHabit != null) {
                            viewModel.updateHabit(
                                existingHabit.copy(
                                    name = name.trim(),
                                    icon = selectedEmoji,
                                    color = selectedColor.toArgb(),
                                    startDate = startDateMillis
                                )
                            )
                        } else {
                            viewModel.addHabit(
                                name = name.trim(),
                                icon = selectedEmoji,
                                color = selectedColor.toArgb(),
                                startDate = startDateMillis
                            )
                        }
                        onNavigateBack()
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Save", fontWeight = FontWeight.Bold)
                }

                if (isEditing && existingHabit != null) {
                    Button(
                        onClick = {
                            viewModel.deleteHabit(existingHabit)
                            onNavigateBack()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Delete", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}`
  }
];
